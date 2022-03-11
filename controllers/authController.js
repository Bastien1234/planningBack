const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const { changedPasswordAfter } = require('./../utils/functions');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body); // fix security leak plzzzz

    const token = signToken(newUser._id);

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync( async(req, res, next) => {
    const {email, password} = req.body;


    //Check if email and password exist
    if (!email || !password)
    {
        return next(new AppError('Please provide email and password', 400))
    }

    // Check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');
    // + password, car on ne le selectionne pas dans le modèle (pour ne pas le retourner aux users qui se servent de l'API)

    if (!await bcrypt.compare(password, user.password) || !user)
    {
        return next(new AppError("Incorrect email or password", 401))
    }

    // If everything is ok, send jwt
    const token =  signToken(user._id);



    res.status(200).json({
        status: 'success',
        token,
        user
    });
})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if(token)
    {
        console.log("this is the token : ", token)
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (changedPasswordAfter(currentUser, decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser; // Use or not, please decide...
    next();
  });

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user'...]. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

async function comparePassword(candidate, current)
{
  try {
    console.log("Try matching passwords !")
    const result = await bcrypt.compare(candidate, current);
    console.log("result : ", result)
    return result;
    
  } catch (e) {
    console.log("Error while comparing passwords :\n", e.message);
  }
  
}


exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findOne({email: req.body.email}).select('+password');
  console.log(user)

  // 2) Check if POSTed current password is correct
  const arePasswordMatching = await comparePassword(req.body.passwordCurrent, user.password);
  if (arePasswordMatching === false) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    message: 'password updated',
    token
  })
});








