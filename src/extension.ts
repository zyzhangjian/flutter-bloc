import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

/**
 * Activates the extension and registers the command for generating Flutter Bloc/Cubit templates.
 * This is the main entry point of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
    // Register the command that will be invoked when users select "Flutter Bloc: New Bloc Template"
  // from the context menu or command palette
  const disposable = vscode.commands.registerCommand(
    "flutter bloc.newBlocTemplate",
    async (uri: vscode.Uri) => {
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
          vscode.window.showErrorMessage(
            "No folder selected and no workspace is open. Please open a workspace or select a folder."
          );
          return;
        }

        // Use the first workspace folder as the default path
        uri = workspaceFolders[0].uri;
      }

      // Validate the URI
      if (uri.scheme !== "file") {
        vscode.window.showErrorMessage(
          "Selected resource is not a valid folder. Please try again."
        );
        console.error("Invalid URI scheme:", uri.scheme);
        return;
      }

      // Ensure the selected resource is a folder
      const selectedPath = uri.fsPath;
      if (
        !fs.existsSync(selectedPath) ||
        !fs.lstatSync(selectedPath).isDirectory()
      ) {
        vscode.window.showErrorMessage(
          "Selected resource is not a valid folder. Please select a folder."
        );
        return;
      }

      // Ask the user to select a mode
      const selectMode = await vscode.window.showQuickPick(["Cubit", "Bloc"], {
        placeHolder: "Select Mode",
      });

      if (!selectMode) {
        return;
      }

      // Prompt the user to input a class name
      const className = await vscode.window.showInputBox({
        placeHolder: "Enter the class name", // Placeholder text
        prompt: "This will create a new Dart class file", // Prompt message
        validateInput: (value) =>
          value ? undefined : "Class name cannot be empty", // Validate that input is not empty
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
      const targetFolderPath =
        createNewFolder === "Yes"
          ? path.join(uri.fsPath, formatClassName(className)) // Create a new folder if "Yes" is selected
          : uri.fsPath; // Use the current folder if "No" is selected

      // Create the Dart class files
      if(selectMode === "Bloc"){
        createBlocClassFile(
          className,
          targetFolderPath,
          createNewFolder === "Yes" // Pass a flag indicating whether to create a new folder
        );
      }else{
        createCubitClassFile(
          className,
          targetFolderPath,
          createNewFolder === "Yes" // Pass a flag indicating whether to create a new folder
        );
      }
    }
  );

  // Add the command to the extension's subscription list
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Creates a new Bloc implementation with associated event and state files.
 * This function generates three files:
 * 1. bloc file - Contains the main Bloc class implementation
 * 2. event file - Defines the events that the Bloc can handle
 * 3. state file - Defines the state structure for the Bloc
 */
function createBlocClassFile(
  className: string,
  folderPath: string,
  createFolder: boolean
) {
  // Format the class name to snake_case
  const formattedClassName = formatClassName(className);

  // Convert the class name to PascalCase
  const upperClassName = className.replace(/(?:^|\_)([a-z])/g, (match) =>
    match.toUpperCase()
  );

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
  const classFilePathBloc = path.join(
    classFolderPath,
    `${formattedClassName}_bloc.dart`
  );
  const classFilePathEvent = path.join(
    classFolderPath,
    `${formattedClassName}_event.dart`
  );
  const classFilePathState = path.join(
    classFolderPath,
    `${formattedClassName}_state.dart`
  );

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

  vscode.window.showInformationMessage(
    `Bloc Class ${upperClassName} created successfully in ${classFolderPath}.`
  );
}

/**
 * Creates a new Cubit implementation with associated state file.
 * This function generates two files:
 * 1. cubit file - Contains the main Cubit class implementation
 * 2. state file - Defines the state structure for the Cubit
 */
function createCubitClassFile(
  className: string,
  folderPath: string,
  createFolder: boolean
) {
  // Format the class name to snake_case
  const formattedClassName = formatClassName(className);

  // Convert the class name to PascalCase
  const upperClassName = className.replace(/(?:^|\_)([a-z])/g, (match) =>
    match.toUpperCase()
  );

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
  const classFilePathCubit = path.join(
    classFolderPath,
    `${formattedClassName}_cubit.dart`
  );
  const classFilePathState = path.join(
    classFolderPath,
    `${formattedClassName}_state.dart`
  );

  // Define template content
  const blocTemplate = `import 'package:bloc/bloc.dart';

import '${formattedClassName.toLowerCase()}_state.dart';

class ${upperClassName}Cubit extends Cubit<${upperClassName}State> {
  ${upperClassName}Cubit() : super(${upperClassName}State()) {

  }
}`;


  const stateTemplate = `class ${upperClassName}State {
  ${upperClassName}State clone() {
    return ${upperClassName}State();
  }
}`;

  // Write content to files
  fs.writeFileSync(classFilePathCubit, blocTemplate);
  fs.writeFileSync(classFilePathState, stateTemplate);

  vscode.window.showInformationMessage(
    `Cubit Class ${upperClassName} created successfully in ${classFolderPath}.`
  );
}

/**
 * Utility function to convert a class name from PascalCase/camelCase to snake_case.
 * Example: "UserProfile" becomes "user_profile"
 * @param className - The original class name in PascalCase or camelCase
 * @returns The formatted class name in snake_case
 */
function formatClassName(className: string): string {
  // Use a regular expression to convert camelCase or PascalCase to snake_case
  return className.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}
