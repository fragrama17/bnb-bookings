const {faker, Sex} = require("@faker-js/faker");
const fs = require('fs');

const N = 10;


const db = JSON.parse(fs.readFileSync('../json-server/db.json', 'utf-8').toString());
db.bookings = [];
db.places= [];

for (let i = 0; i < N; i++) {

  const place = {};
  place.id = faker.database.mongodbObjectId();
  place.title = faker.address.cityName();
  place.price = Number(faker.commerce.price(25, 300, 2));
  place.imageUrl = 'https://media.istockphoto.com/photos/bed-and-breakfast-sign-picture-id611299750?k=20&m=611299750&s=612x612&w=0&h=I5sgohWYqg4JiAH8HC72QJ-PcCFYqbFQhXlF81hai0Y=';
  place.availableFrom = new Date();
  const to = new Date().setFullYear(new Date().getFullYear() + 1);
  place.availableTo = new Date(to);
  place.userId = faker.database.mongodbObjectId();
  place.location = {
    address: faker.address.streetAddress(true),
    lat: faker.address.latitude(),
    lng: faker.address.longitude(),
  }

  const booking = {};
  booking.id = faker.database.mongodbObjectId();
  booking.placeId = place.id;
  booking.userId = faker.database.mongodbObjectId();
  booking.placeTitle = place.title;
  booking.placeImage = place.imageUrl;
  booking.firstName = faker.name.firstName(Sex.Male);
  booking.lastName = faker.name.lastName(Sex.Male);
  booking.guestNumber = Number((Math.random() * 10).toFixed(0));
  booking.bookedFrom = new Date();
  const _to = new Date().setDate(new Date().getDate() + 7);
  booking.bookedTo = new Date(_to);

  db.places.push(place);
  db.bookings.push(booking);
}

fs.writeFileSync('../json-server/db.json', JSON.stringify(db));

