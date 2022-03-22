const Users = require('./../models/userModel');

const log = (args) => {
    console.log(args);
}

exports.getAllUsers = async(req, res, next) => {
    // This will return all users in a given team

    log("entering get all users");

    try {
        log("entering try block");
        const userTeam = req.body.team;
        const allUsers = await Users.find({"team": req.params.team});

        log("after promise returned");

        let arrayToReturn = [];

        allUsers.forEach((el) => {
                let myObj = {};
                myObj.firstName = el.firstName;
                myObj.lastName = el.lastName;
                myObj.email = el.email;
                myObj.id = el.id;
                myObj.shifts = el.shifts;
                myObj.messages = el.messages;
                arrayToReturn.push(myObj);
        })

        log("just before response");

        res.status(200).json({
            status: 'success',
            results: allUsers.length,
            team: userTeam,
            data: arrayToReturn
        })
    } catch (e) {
        log("entering catch block");
        console.log(e)
        res.status(400).json({
            status: 'failed',
            data: e
        })
    }

    next();
}



// // Replaced by signUP in authController

// exports.createUser = async(req, res, next) => {

//     try {
//         const newUser = await Users.create(req.body);

//         /*
//             Exemple of body

//             {
//                 "firstName": "johnny",
//                 "lastName": "doe",
//                 "isAdmin": false,
//                 "daysOff": [1, 2],
//                 "email": "john23",
//                 "team": "teamz",
//                 "password": "test1234",
//                 "confirmPassword": "test1234"
//             }
// }
//         */

//         res.status(201).json({
//             status: 'success',
//             data: newUser
//         })
//     } catch (e) {
//         console.log(e);
//         res.status(400).json({
//             status: 'failed',
//             data: e
//         })
//     }

//     next();
// }


exports.modifyUser = async(req, res, next) => {
    try {
        const updatedUser = await Users.findOneAndUpdate({email: req.body.email},
            {daysOff: req.body.daysOff})

        res.status(201).json({
            status: 'success',
            message: 'User successfully updated'
        })
    }

    catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'failed',
            data: e
        })
    }

    next();
}

exports.deleteUser = async(req, res, next) => {

    try {
        const id = req.params.id;
        const document = await Users.findByIdAndDelete(id);

        if (!document)
        {
            res.status(404).json({
                status: 'failed',
                message: 'Document not found'
            })
        }

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    
    catch (err) {
        res.status(400).json({
            status: 'failed',
            data: err
        })
    }

    next();
}

exports.generateCurrentMonth = async(req, res, next) => {
    try {
        const employees = await Users.find({"team": req.body.team});
        const month = req.body.month // en JS on doit faire -1, les mois commencent à 0
        const year = req.body.year;
        const daysInMonth = new Date(year, month+1, 0).getDate();

        for (let i=1; i<=daysInMonth; i++) {
            let startingDate = new Date(year, month, i) // remettre i+1 si ça résoud pas le soucis
            employees.forEach(async (employee) => {
                const newIndexDay = startingDate.toISOString().split('T')[0];
                const newShift = employee.daysOff.includes(startingDate.getUTCDay()) ? 'off' : 'na';
                let daysAlreadyGenerated = [];
                employee.shifts.forEach(el => daysAlreadyGenerated.push(el.indexDay));
                if (!(daysAlreadyGenerated.includes(newIndexDay))) {
                    await Users.updateOne({_id: employee._id}, {$push: {shifts: {indexDay: newIndexDay, 
                        shift: newShift}}});
                }
            })
        }

        if(req.body.team === undefined){
            res.status(400).json({
                status: 'failed',
                data: 'No team provided'
            })
        }

        else if(employees.length === 0){
            res.status(400).json({
                status: 'failed',
                data: 'No user have been found, no data generated'
            })
        }

        else {
            res.status(200).json({
                status: 'success',
                data: 'Current month has been generated'
            })
        }
        
    }

    catch (err) {
        res.status(400).json({
            status: 'failed',
            data: err
        })
    }

    next();
}

exports.deleteCurrentMonth = async(req, res, next) => { // Ne delete pas toujours tous les shifts...


    const boolMatchingMonth = (month, indexDay) => { // returns true or false, matching required month or not
        month = month.toString();
        if (month.length === 1) {
            month = '0' + month;
        }

        if (month === indexDay.substring(5, 7))
        {
            return true;
        }

        return false;
    }


    const month = req.body.month;
    const team = req.body.team;

    const user = await Users.findOne({email: req.body.email}, function(err, user) {
        try {
            let shifts = user.shifts;

            for (shift of shifts)
            {
                toDelete = (boolMatchingMonth(month, shift.indexDay));
                if(toDelete === true){
                    console.log(shift)
                    shift.remove();
                }
            }

            user.save();

            

            res.status(200).json({
                status: 'success',
                data: 'current month deleted'
            })
        }
        

        catch(err) {
            res.status(400).json({
                status: 'failed',
                data: err
            })
        }

    })

}

// The following methods are not implemented yet on front end

exports.sendMessage = async(req, res, next) => {

    try {
    // Here we are going to pick users by emails
    const message = req.body.message;

    if (message && req.body.sender && req.body.receiver)
    {
        await Users.updateOne(
            {"email": req.body.receiver},
            {$push: {
                messages: {
                from: req.body.sender,
                message: req.body.message
                }
            }}
        )

        res.status(200).json({
            status: 'success',
            data: 'message has been sent',
            sentMessage: req.body.message
        })
    }

    else
    {
        res.status(400).json({
            status: 'failed',
            data: 'bad parameters'
        })
    }

    }
    
    catch (err) {
        res.status(400).json({
            status: 'failed',
            data: err
        })
    }

    next();
}


exports.deleteMessage = async(req, res, next) => {

        const paramsId = req.params.id;
        const messageId = req.params.messageid;

        await Users.findById(paramsId, function(err, user) {
            try {
                let messageFound = false;
                let messagesOfDocument = user.messages;
                messagesOfDocument.forEach(el => {
                    if (el._id == messageId) {
                        el.remove();
                        messageFound = true;
                    }
                })

                user.save(function(err){
                    if (err) throw err;
                })

                messageFound === true ?
                res.status(200).json({
                    status: 'success',
                    data: 'Message has been deleted'
                })

                :
                res.status(404).json({
                    status: 'failed',
                    data: 'Message does not exists'
                })

            }

            catch (error) {
                res.status(404).json({
                    status: 'failed',
                    data: 'Document not found'
                })
            }
        
            next();

        });        

        
    
    
}

exports.requestShiftChange = async(req, res, next) => {

        try {
            const indexDay = req.body.indexDay;
            const newShift = req.body.newShift;

            await Users.findOne({"email": req.body.requestor}, function(err, user) {
                let shifts = user.shifts;
                shifts.forEach(el => {
                    
                    
                    if (el.indexDay === indexDay)
                    {
                        el.shift = newShift;
                    }

                    
                })

                user.save(function(err) {
                    if (err) throw err;
                })
            })

    
            res.status(200).json({
                status: 'success',
                data: 'Shifts successfully changed'
            })
    
        }
        
        catch (err) {
            res.status(404).json({
                status: 'failed',
                data: 'Document not found'
            })
        }
    
        next();
}

exports.requestVacations = async(req, res, next) => {
    
    // This function help to match the JS date type to the indexDay key in the database.
    // final format of the string : "YYYY-MM-DD"
    const dateToIndexDay = date => {
        formatedDate = date.toISOString().split("T")[0];

        return formatedDate;
    }

    // Firstly, we have to grab the begining and ending dates of the request
    const beginingDate = new Date(req.body.beginingDate);
    const endingDate = new Date(req.body.endingDate);

    // Set a variable to keep track if the asked dates are already generated
    let datesBeginingExist = false;
    let datesEndExist = false;

    // Generating an error in the case somebody request a date which is prior to the current date
    const now = new Date();
    if (beginingDate < now || endingDate < now || beginingDate > endingDate)
    {
        res.status(400).json({
            status: "failed",
            data: "Please provide valid dates"
        })
    }

    const user = await Users.findOne({"email": req.body.userEmail}, function(err, user){

        if (err) 
        {res.status(400).json({
            status: "failed",
            data: "We got some error my friend..."
        })}

        user.shifts.forEach(el => {
            if (el.indexDay === dateToIndexDay(beginingDate))
                {datesBeginingExist = true;}
            else if (el.indexDay === dateToIndexDay(endingDate))
                {datesEndExist = true;}
        })

        // get the difference in days between the two dates
        const getDaysDifference = (dateEnd, dateBegin) => {
            const millisecToDay = 1000 * 60 * 60 * 24;
            const end = dateEnd.getTime() / millisecToDay;
            const begining = dateBegin.getTime() / millisecToDay;
            return end - begining + 1; // Because dates are inclusives
        }
        
        const totalDaysRequested = getDaysDifference(endingDate, beginingDate);

        // Loop from first date to last date and update the database
        const targetDate = new Date(beginingDate);

        // If dates are ok, let's go !
        if (datesBeginingExist === true || datesEndExist === true)
        {
            for (let i=0; i<totalDaysRequested; i++)
            {
                // This operation's time is O(n2) so maybe we can find a better algo for better perfs
                user.shifts.forEach(shift => {
                    if (shift.indexDay === dateToIndexDay(targetDate))
                    {
                        shift.shift = "cp";
                    }
                })
                targetDate.setDate(targetDate.getDate() + 1);
            }
                
            user.save(function(err){
                if(err)
                    throw err;
            })

            res.status(200).json({
                status: "success",
                data: "Okaaaaay for your vacations !"
            })
            

        }

        else
        {
            res.status(400).json({
                status: "failed",
                data: "Those dates are not generated yet baby"
            })
        }

    })

    next();
}