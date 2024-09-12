import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://gmmsahztdebjviekwsyz.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXNhaHp0ZGVianZpZWt3c3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg0NTc5NDAsImV4cCI6MjAxNDAzMzk0MH0.EXtUNhHzwo6nxL78oLmaWS3PzV2fToEaygGZ2BMUO84";
const supabase = createClient(supabaseUrl, supabaseKey);

let tanks = {};
async function getTanks() {
	let { data: Tanks, error } = await supabase.from("Tanks").select("*");
	tanks = Tanks;
}
await getTanks();
tanks.sort((a, b) => {
	return a.Al2O3 - b.Al2O3;
});
const modal = document.getElementById("editModal");
const body = document.getElementById("body");
const updateBtn = document.getElementById("update");
const cancelBtn = document.getElementById("cancel");
const blurElement = document.getElementById("blurElement");
blurElement.onclick = () => {
	closeModal();
};
const al2o3 = document.getElementById("Al2O3");
const al = document.getElementById("Al");
al2o3.addEventListener("input", (e) => {
	al.value = Math.round((parseFloat(al2o3.value) / 1.89) * 100) / 100;
});

const order = [
	"Product",
	"SG",
	"Al2O3",
	"Al",
	"Basicity",
	"AlumPercent",
	"FreeAcid",
	"pH",
	"Chloride",
	"Turbidity",
	"Updated",
];

let tankMem = "";
async function update() {
	let forms = document.getElementsByClassName("data");
	for (let form of forms) {
		let prop = form.id;
		let val = form.value;
		tankMem[prop] = val;
	}
	const { data, error } = await supabase
		.from("Tanks")
		.update({
			Product: tankMem.Product,
			SG: parseFloat(tankMem.SG),
			Al2O3: parseFloat(tankMem.Al2O3),
			Al: parseFloat(tankMem.Al),
			Basicity: parseFloat(tankMem.Basicity),
			AlumPercent: parseFloat(tankMem.AlumPercent),
			FreeAcid: parseFloat(tankMem.FreeAcid),
			pH: parseFloat(tankMem.pH),
			Chloride: parseFloat(tankMem.Chloride),
			Turbidity: parseFloat(tankMem.Turbidity),
			Updated: new Date(tankMem.Updated),
		})
		.eq("id", tankMem.id)
		.select();
	console.log(data);
	console.log(error);
	closeModal();
	location.reload();
}
function openModal(name) {
	let tank = tanks.filter((e) => e.Name == name)[0];
	tankMem = tank;
	let formEntries = document.getElementsByClassName("row");
	for (let row of formEntries) {
		let placeHolder = 0;
		for (let elem of row.children) {
			if (elem.attributes.for) {
				let attribute = elem.attributes.for.value;
				placeHolder = tank[attribute];
				if (attribute == "Name") {
					elem.innerHTML = tank[attribute].bold();
				} else {
					elem.innerHTML = `${attribute}`;
				}
			}
			if (elem.children.length == 1) {
				let input = elem.children[0];
				input.value = placeHolder;
				if (input.type == "date") {
					let today = new Date();
					let dd = String(today.getDate()).padStart(2, "0");
					let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
					let yyyy = today.getFullYear();

					today = yyyy + "-" + mm + "-" + dd;
					input.value = today;
				}
			}
		}
	}
	modal.classList.remove("hidden");
	blurElement.classList.remove("hidden");
}
function closeModal() {
	tankMem = "";
	modal.classList.add("hidden");
	blurElement.classList.add("hidden");
}
cancelBtn.onclick = () => {
	closeModal();
};
updateBtn.onclick = () => {
	update();
};
for (let tank of tanks) {
	let tr = document.createElement("tr");
	let txt = tank.Name;
	const name = document.createElement("th");
	name.appendChild(document.createTextNode(txt));
	tr.appendChild(name);
	for (let column of order) {
		const td = document.createElement("td");
		txt = tank[column];
		if (txt == null) {
			txt = "  ";
		}
		td.appendChild(document.createTextNode(txt));
		tr.appendChild(td);
	}
	let updateBtn = document.createElement("td");
	updateBtn.setAttribute("tank", tank.Name);
	updateBtn.style.cursor = "pointer";
	txt = "Edit";
	updateBtn.appendChild(document.createTextNode(txt));
	updateBtn.onclick = () => {
		openModal(tank.Name);
	};
	tr.appendChild(updateBtn);
	body.appendChild(tr);
}
