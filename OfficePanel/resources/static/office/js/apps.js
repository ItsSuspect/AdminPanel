let currentIndexApp = 0;
let lastLoadedAppId = apps.length > 0 ? apps[apps.length - 1].id : null;
let filteredApps = apps;

document.addEventListener("DOMContentLoaded", () => {
	renderApps();
});

function editTableRowApp(app) {
	const appRow = document.querySelector(`div.table__row[data-appId="${app.id}"]`);
	appRow.innerHTML = getTableRowContentApp(app);
}

function addAppToTable(container, app) {
	const appHtml = `
            <div class="table__row" data-appid="${app.id}">
                ${getTableRowContentApp(app)}
            </div>
        `;
	container.insertAdjacentHTML("afterbegin", appHtml);
}

function getTableRowContentApp(app) {
	let el_class = "";
	if (app.indicator) el_class = "table__status-dot_loaded";
	else el_class = "table__status-dot"

	return `
    <div class="table__cell table__cell_content_id" data-label="ID">
        <p class="table__cell-text">${app.id}</p>
    </div>
    <div class="table__cell table__cell_content_name" data-label="Name">
        <p class="table__cell-text">${app.name}</p>
    </div>
    <div class="table__cell table__cell_content_version" data-label="Version">
        <p class="table__cell-text">${app.version}</p>
    </div>
    <div class="table__cell table__cell_content_min-version" data-label="Min version">
        <p class="table__cell-text">${app.minVersion}</p>
    </div>
    <div class="table__cell table__cell_content_description" data-label="Description">
        <p class="table__cell-text">${app.description}</p>
    </div>
    <div class="table__cell table__cell_content_active-keys" data-label="Active keys">
      <p class="table__cell-text">${app.activeKeys}</p>
    </div>
	<div class="table__status-dot ${el_class}"></div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit"
			data-appId="${app.id}" data-name="${app.name}"
			data-version="${app.version}" data-minVersion="${app.minVersion}"
			data-description="${app.description}" onclick="openEditAppWindow(this)"></button>
        <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteAppWindow(${app.id})"></button>
    </div>`;
}

function renderApps() {
	const container = document.querySelector("#tableContentApps");
	const end = currentIndexApp + batchSize;
	const slice = filteredApps.slice(currentIndexApp, end);

	slice.forEach((app) => addAppToTable(container, app));

	currentIndexApp = end;
}

async function searchTableApps(event) {
	event.preventDefault();

	let input = document.getElementById("searchInputApps").value.toLowerCase();
	const tableContentApps = document.getElementById("tableContentApps");

	if (input === "") {
		filteredApps = apps;
		currentIndexApp = 0;
		lastLoadedAppId = 0;
		tableContentApps.innerHTML = "";
		renderApps();
		return;
	}

	let searchTerms = input.split("+").map((term) => term.trim());

	try {
		let response = await fetch("/office/searchApplications", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ searchTerms: searchTerms }),
		});

		if (!response.ok) {
			console.log("Network response was not ok");
			return;
		}

		let data = await response.json();

		tableContentApps.innerHTML = "";
		if (data.length > 0) {
			filteredApps = data;
			currentIndexApp = 0;
			renderApps();
		} else {
			tableContentApps.innerHTML = '<div class="table__no-data">Данные отсутствуют</div>';
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

function openAddApplicationWindow() {
	document.getElementById("add-app-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function openEditAppWindow(element) {
	document.getElementById("edit-app-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonEdit = document.getElementById("edit-app-button");
	buttonEdit.setAttribute("data-appId", element.getAttribute("data-appId"));
	document.getElementById("name-edit-app").value = element.getAttribute("data-name");
	document.getElementById("version-edit-app").value = element.getAttribute("data-version");
	document.getElementById("min-version-edit-app").value = element.getAttribute("data-minVersion");
	document.getElementById("description-edit-app").value = element.getAttribute("data-description");
}

function openDeleteAppWindow(appId) {
	document.getElementById("delete-app-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonDelete = document.getElementById("delete-app-button");
	buttonDelete.setAttribute("data-appId", appId);
}

async function readFileAsString(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);

		reader.readAsText(file, "UTF-8");
	});
}

function downloadFile(content, fileName) {
	const blob = new Blob([content], { type: "application/javascript" });
	const url = URL.createObjectURL(blob);

	const downloadLink = document.createElement("a");
	downloadLink.href = url;
	downloadLink.download = fileName;

	downloadLink.click();

	URL.revokeObjectURL(url);
}

async function addApplication() {
	try {
		let body = {
			name: document.getElementById("name-app").value,
			version: document.getElementById("version-app").value,
			description: document.getElementById("description-app").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/office/addApplication", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				addAppToTable(document.querySelector("#tableContentApps"), data.app);
				apps.push(data.app);

				closePopup();
			}
		} else {
			console.log(response.status);
		}
	} catch (e) {
		console.log(e);
	}
}

async function editApp(element) {
	try {
		let obsf_settings = {
			compact: true,
			controlFlowFlattening: true,
			controlFlowFlatteningThreshold: 1,
			deadCodeInjection: true,
			deadCodeInjectionThreshold: 1,
			debugProtection: true,
			debugProtectionInterval: 0,
			disableConsoleOutput: false,
			domainLock: [],
			domainLockRedirectUrl: 'about:blank',
			forceTransformStrings: [],
			identifierNamesCache: {},
			identifierNamesGenerator: 'hexadecimal',
			identifiersDictionary: [],
			identifiersPrefix: '',
			ignoreImports: false,
			inputFileName: '',
			log: false,
			numbersToExpressions: true,
			optionsPreset: 'default',
			renameGlobals: true,
			renameProperties: false,
			renamePropertiesMode: 'safe',
			reservedNames: [],
			reservedStrings: [],
			seed: 0,
			selfDefending: true,
			simplify: true,
			sourceMap: false,
			sourceMapBaseUrl: '',
			sourceMapFileName: '',
			sourceMapMode: 'separate',
			sourceMapSourcesMode: 'sources-content',
			splitStrings: true,
			splitStringsChunkLength: 5,
			stringArray: true,
			stringArrayCallsTransform: true,
			stringArrayCallsTransformThreshold: 0.5,
			stringArrayEncoding: ['rc4'],
			stringArrayIndexesType: ['hexadecimal-number'],
			stringArrayIndexShift: true,
			stringArrayRotate: true,
			stringArrayShuffle: true,
			stringArrayWrappersCount: 5,
			stringArrayWrappersChainedCalls: true,
			stringArrayWrappersParametersMaxCount: 2,
			stringArrayWrappersType: 'function',
			stringArrayThreshold: 0.75,
			target: 'browser',
			transformObjectKeys: true,
			unicodeEscapeSequence: false
		}

		let obsf_settings_multiple = obsf_settings

		let files = document.querySelector('#multiple_files').files

		for (let file of files) {

			let file_name = file.name
			let readed_file = await readFileAsString(file)
			if (!readed_file) {
				console.log('Ошибка чтения')
				return
			}

			let obfs_result = JavaScriptObfuscator.obfuscate(readed_file, obsf_settings_multiple)
			let obf_code = obfs_result.getObfuscatedCode()

			downloadFile(obf_code, file_name)
		}


		const secondPartFile = document.getElementById("second_part-edit").files[0]
		let secondPartFile_output
		const initialFile = document.getElementById("initial-edit").files[0]
		let initialFile_output
		const basicsFile = document.getElementById("basics-edit").files[0]
		let basicsFile_output
		const background = document.getElementById("background-edit").files[0]

		if (secondPartFile && background && initialFile && basicsFile) {
			/*1*/
			/*обфуцируем файл second_part и кодируем его*/
			let obfs_second_part = JavaScriptObfuscator.obfuscate(await readFileAsString(secondPartFile), obsf_settings)
			obsf_settings.identifierNamesCache = obfs_second_part.getIdentifierNamesCache()
			console.log('список идентификаторов обновлен', obsf_settings.identifierNamesCache)

			let obf_second_part_code = obfs_second_part.getObfuscatedCode()
			obf_second_part_code = encrypt(obf_second_part_code)
			secondPartFile_output = obf_second_part_code

			/*2*/
			/*обфуцируем файл background*/

			let obfs_background = JavaScriptObfuscator.obfuscate(await readFileAsString(background), obsf_settings)

			obsf_settings.identifierNamesCache = obfs_background.getIdentifierNamesCache()
			console.log('список идентификаторов обновлен', obsf_settings.identifierNamesCache)

			let obf_background_code = obfs_background.getObfuscatedCode()

			/*3*/
			/*обфуцируем файл initial*/

			let obfs_initial = JavaScriptObfuscator.obfuscate(await readFileAsString(initialFile), obsf_settings)

			obsf_settings.identifierNamesCache = obfs_initial.getIdentifierNamesCache()
			console.log('список идентификаторов обновлен', obsf_settings.identifierNamesCache)

			let obf_initial_code = obfs_initial.getObfuscatedCode()
			initialFile_output = obf_initial_code

			/*4*/
			/*обфуцируем файл basics и кодируем его дважды*/

			let obfs_basics = JavaScriptObfuscator.obfuscate(await readFileAsString(basicsFile), obsf_settings)

			obsf_settings.identifierNamesCache = obfs_basics.getIdentifierNamesCache()
			console.log('список идентификаторов обновлен', obsf_settings.identifierNamesCache)

			let obf_basics_code = obfs_basics.getObfuscatedCode()
			obf_basics_code = encrypt(obf_basics_code)
			obf_basics_code = xorEncrypt(obf_basics_code)
			basicsFile_output = obf_basics_code

			console.log('Текущий obf_background_code', obf_background_code)
			for (let key in obsf_settings.identifierNamesCache.globalIdentifiers) {
				if (key[0] === '_') continue
				if (obf_background_code.includes(key)) console.log(key, 'был заменена на', obsf_settings.identifierNamesCache.globalIdentifiers[key])
				obf_background_code = obf_background_code.replaceAll(key, obsf_settings.identifierNamesCache.globalIdentifiers[key])
			}
			console.log('obf_background_code после замен', obf_background_code)

			downloadFile(obf_background_code, 'background')
		}

		let body = {
			appId: element.getAttribute("data-appId"),
			name: document.getElementById("name-edit-app").value,
			version: document.getElementById("version-edit-app").value,
			minVersion: document.getElementById("min-version-edit-app").value,
			description: document.getElementById("description-edit-app").value,
			initial: initialFile ? initialFile_output : null,
			secondPart: secondPartFile ? secondPartFile_output : null,
			basics: basicsFile ? basicsFile_output : null
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/office/editApplication", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				apps = apps.map((app) => app.id === data.app.id ? data.app : app);
				editTableRowApp(data.app);
				closePopup();
			}
		}
	} catch (e) {
		console.log(e);
	}
}

async function deleteApp(element) {
	try {
		let response = await fetch("/office/deleteApp/" + element.getAttribute("data-appId"), {
			method: "POST",
		}
		);

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				apps = apps.filter((app) => app.id !== data.appId);
				document.querySelector('.table_content_applications .table__row[data-appid="' + element.getAttribute("data-appId") + '"]').remove();
				closePopup();
			}
		}
	} catch (e) {
		console.log(e);
	}
}

function encrypt(input) {
	const unicodeCodes = Array.from(input).map(char => char.codePointAt(0));
	const shuffledCodes = [...unicodeCodes];

	for (let i = 0; i < shuffledCodes.length - 1; i += 2) {
		[shuffledCodes[i], shuffledCodes[i + 1]] = [shuffledCodes[i + 1], shuffledCodes[i]];
	}

	return shuffledCodes.map(code => String.fromCodePoint(code)).join('')
}

const xorEncrypt = (text) => {
	let salt = 'FrostGuru'
	const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
	const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
	const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

	return text
		.split("")
		.map(textToChars)
		.map(applySaltToChar)
		.map(byteHex)
		.join("");
}