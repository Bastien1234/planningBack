const { isTemplateSpan } = require('typescript');
const Users = require('./../models/userModel');

exports.getAllUsers = async(req, res, next) => {
    try {
        const allUsers = await Users.find();

        res.status(200).json({
            status: 'success',
            results: allUsers.length,
            data: allUsers
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({
            status: 'failed',
            data: e
        })
    }

    next();
}

exports.createUser = async(req, res, next) => {
    console.log(req.body)

    try {
        const newUser = await Users.create(req.body);

        res.status(201).json({
            status: 'success',
            data: newUser
        })
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'failed',
            data: e
        })
    }

    next();
}

exports.generateNextWeek = async(req, res, next) => {
    try {
        const employees = await Users.find();
        const date = new Date();

        while (date.getDay() !== 1) {
            date.setDate(date.getDate()+1)
        }

        for (let i=0; i<7; i++) {

            employees.forEach(async (employee) => {
                const newIndexDay = date.toISOString().split('T')[0];
                const newShift = employee.daysOff.includes(date.getDay()) ? 'off' : 'na';
                let daysAlreadyGenerated = [];
                employee.shifts.forEach(el => daysAlreadyGenerated.push(el.indexDay));
                if (!(daysAlreadyGenerated.includes(newIndexDay))) {
                    await Users.updateOne({_id: employee._id}, {$push: {shifts: {indexDay: newIndexDay, 
                        shift: newShift}}});
                }


            })

            date.setDate(date.getDate()+1);
        }

        res.status(200).json({
            status: 'success',
            message: 'new week generated'
        })

    } catch (err) {
        res.status(400).json({
            status: 'failed',
            data: err
        })
    }
    

    next();
}

exports.generateCurrentMonth = async(req, res, next) => {
    try {
        const employees = await Users.find();
        const date = new Date();
        const currentMonth = date.getMonth()
    }

    catch (e) {
        console.log(e)
    }
}