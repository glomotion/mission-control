
const moo = { cow: true, dog: false };

const woof = { moo, ...{
	dog: true,
}};

console.log(moo, woof);