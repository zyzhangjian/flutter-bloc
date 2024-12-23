/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
function activate(context) {
    // Register a command: Flutter Bloc - New Bloc Template
    const disposable = vscode.commands.registerCommand("flutter bloc.newBlocTemplate", async (uri) => {
        if (!uri || !uri.fsPath) {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                openLabel: "Select Folder",
            });
            if (!folderUri || folderUri.length === 0) {
                vscode.window.showErrorMessage("No folder selected.");
                return;
            }
            uri = folderUri[0];
        }
        // Check if URI is provided
        if (!uri) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage("No folder selected and no workspace is open. Please open a workspace or select a folder.");
                return;
            }
            // Use the first workspace folder as the default path
            uri = workspaceFolders[0].uri;
        }
        // Validate the URI
        if (uri.scheme !== "file") {
            vscode.window.showErrorMessage("Selected resource is not a valid folder. Please try again.");
            console.error("Invalid URI scheme:", uri.scheme);
            return;
        }
        // Ensure the selected resource is a folder
        const selectedPath = uri.fsPath;
        if (!fs.existsSync(selectedPath) ||
            !fs.lstatSync(selectedPath).isDirectory()) {
            vscode.window.showErrorMessage("Selected resource is not a valid folder. Please select a folder.");
            return;
        }
        // Prompt the user to input a class name
        const className = await vscode.window.showInputBox({
            placeHolder: "Enter the class name", // Placeholder text
            prompt: "This will create a new Dart class file", // Prompt message
            validateInput: (value) => value ? undefined : "Class name cannot be empty", // Validate that input is not empty
        });
        if (!className) {
            return; // Cancel the operation if no class name is entered
        }
        // Ask the user if a new folder is needed for the files
        const createNewFolder = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Do you want to create a new folder for the files?", // Prompt message
        });
        if (!createNewFolder) {
            return; // Cancel the operation if no choice is made
        }
        // Determine the target folder path
        const targetFolderPath = createNewFolder === "Yes"
            ? path.join(uri.fsPath, formatClassName(className)) // Create a new folder if "Yes" is selected
            : uri.fsPath; // Use the current folder if "No" is selected
        // Create the Dart class files
        createDartClassFile(className, targetFolderPath, createNewFolder === "Yes" // Pass a flag indicating whether to create a new folder
        );
    });
    // Add the command to the extension's subscription list
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
// Function: Create Dart class files
function createDartClassFile(className, folderPath, createFolder) {
    // Format the class name to snake_case
    const formattedClassName = formatClassName(className);
    // Convert the class name to PascalCase
    const upperClassName = className.replace(/(?:^|\_)([a-z])/g, (match) => match.toUpperCase());
    // Check if folderPath already contains formattedClassName to avoid duplicate concatenation
    const classFolderPath = createFolder
        ? folderPath.endsWith(formattedClassName)
            ? folderPath // If the path already contains the class name, use it directly
            : path.join(folderPath, formattedClassName) // Otherwise, append the new path
        : folderPath;
    // Check if the target folder already exists to avoid duplicate creation
    if (!fs.existsSync(classFolderPath)) {
        fs.mkdirSync(classFolderPath, { recursive: true });
    }
    // Define file paths
    const classFilePathBloc = path.join(classFolderPath, `${formattedClassName}_bloc.dart`);
    const classFilePathEvent = path.join(classFolderPath, `${formattedClassName}_event.dart`);
    const classFilePathState = path.join(classFolderPath, `${formattedClassName}_state.dart`);
    // Define template content
    const blocTemplate = `import 'package:bloc/bloc.dart';

import '${formattedClassName.toLowerCase()}_event.dart';
import '${formattedClassName.toLowerCase()}_state.dart';

class ${upperClassName}Bloc extends Bloc<${upperClassName}Event, ${upperClassName}State> {
  ${upperClassName}Bloc() : super(${upperClassName}State()) {
    on<InitEvent>(_init);
  }

  void _init(InitEvent event, Emitter<${upperClassName}State> emit) async {
    emit(state.clone());
  }
}`;
    const eventTemplate = `abstract class ${upperClassName}Event {}

class InitEvent extends ${upperClassName}Event {}`;
    const stateTemplate = `class ${upperClassName}State {
  ${upperClassName}State clone() {
    return ${upperClassName}State();
  }
}`;
    // Write content to files
    fs.writeFileSync(classFilePathBloc, blocTemplate);
    fs.writeFileSync(classFilePathEvent, eventTemplate);
    fs.writeFileSync(classFilePathState, stateTemplate);
    vscode.window.showInformationMessage(`Class ${upperClassName} created successfully in ${classFolderPath}.`);
}
// Utility function: Format the class name to snake_case
function formatClassName(className) {
    // Use a regular expression to convert camelCase or PascalCase to snake_case
    return className.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map