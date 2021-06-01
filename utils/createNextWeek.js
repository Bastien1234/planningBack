const mockUsers = require('./databaseUsers');

const getNextWeek = (employees) => {
	let defaultWeeklyPlanning = {};
	employees.forEach(el => defaultWeeklyPlanning[el.name] = 'na')

	const date = new Date();

	let arrayToReturn = [];

	while (date.getDay() !== 1) {
		date.setDate(date.getDate()+1)
	}

	for (let i=0; i<7; i++) {

		// first populate the employee db

		employees.forEach(employee => {
			employee.shift.push({
				indexDay: date.toISOString().split('T')[0],
				//shift: 'na'
				shift: employee.dayOff.includes(date.getDay()) ? 'off' : 'na'
			})
		})

		// then generate from that db

		let shiftToPush = {};
		employees.forEach(employee => {
			let currentDayShift;
			employee.shift.forEach(el => {
				if (el.indexDay === date.toISOString().split('T')[0]) {
					currentDayShift = el.shift;
				}
				shiftToPush[employee.name] = currentDayShift;
			})
		})
	
	
		arrayToReturn.push({
			indexDay: date.toISOString().split('T')[0],
			day: date.getDate(),
			month: date.getMonth() +1,
			weekDay: date.getDay(),
			shift: {...shiftToPush}
		})

		



		date.setDate(date.getDate()+1);
	}

	return arrayToReturn;
}

const setShift = (employee, arrayOfEmployees, indexDay, newShift) => {
	arrayOfEmployees.forEach(el => {
		if (el.name === employee) {
			el.shift.forEach(elDay => {
				if(elDay.indexDay === indexDay) {
					elDay.shift = newShift;
				}
			})
		}
	})
}

const sendMessage = (database, body, sender, receiver) => {
	if (body.length > 100) return;

	const filteredSender = (database.filter(el => el.name === sender))[0];
	const filteredReceiver = (database.filter(el => el.name === receiver))[0];
	const date = new Date();


	filteredReceiver.messages.push(
		{
			date: date.toISOString().replace('T', ',').split('.')[0],
			from: filteredSender.name,
			message: body
		}
	)
}

console.log(getNextWeek(mockUsers));
setShift('Bastien', mockUsers, '2021-06-02', 'modif')
sendMessage(mockUsers, 'coucou amour, fais moi un café', 'Bastien', 'Misao')
setShift('Misao', mockUsers, '2021-06-02', 'lalalalala')

console.log(mockUsers[1])

