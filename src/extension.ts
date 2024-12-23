// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// This method is called when your extension is activated
// The extension is activated the first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Register a command: Flutter Bloc - New Bloc Template
  const disposable = vscode.commands.registerCommand(
    "flutter-bloc.newBlocTemplate",
    async (uri: vscode.Uri) => {
      // Ensure a valid folder path is selected
      if (!uri || uri.scheme !== "file") {
        vscode.window.showErrorMessage(
          "No folder selected. Please select a folder and try again."
        );
        return;
      }

      console.log("Selected folder URI:", uri); // Log the selected folder path for debugging

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
      createDartClassFile(
        className,
        targetFolderPath,
        createNewFolder === "Yes" // Pass a flag indicating whether to create a new folder
      );
    }
  );

  // Add the command to the extension's subscription list
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Function: Create Dart class files
function createDartClassFile(
  className: string,
  folderPath: string,
  createFolder: boolean
) {
  // Format the class name to snake_case, e.g., CreateName -> create_name
  const formattedClassName = formatClassName(className);

  // Convert the class name to PascalCase, e.g., create_name -> CreateName
  const upperClassName = className.replace(/(?:^|\_)([a-z])/g, (match) =>
    match.toUpperCase()
  );

  console.log("className =", upperClassName); // Log the formatted class name for debugging

  // Determine the folder path where files will be created
  const classFolderPath = createFolder
    ? path.join(folderPath, formattedClassName) // Add a subfolder if needed
    : folderPath; // Use the given folder path if no subfolder is needed

  // Define the file paths for Bloc, Event, and State
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

  // Create the folder if needed
  if (createFolder) {
    fs.mkdirSync(classFolderPath, { recursive: true });
  }

  // Define the Bloc template code
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

  // Define the Event template code
  const eventTemplate = `abstract class ${upperClassName}Event {}
  
class InitEvent extends ${upperClassName}Event {}`;

  // Define the State template code
  const stateTemplate = `class ${upperClassName}State {
  ${upperClassName}State clone() {
    return ${upperClassName}State();
  }
}`;

  // Create and write content to the files
  fs.writeFileSync(classFilePathBloc, blocTemplate);
  fs.writeFileSync(classFilePathEvent, eventTemplate);
  fs.writeFileSync(classFilePathState, stateTemplate);

  // Show a message indicating the operation was successful
  vscode.window.showInformationMessage(
    `Class ${upperClassName} created successfully in ${classFolderPath}.`
  );
}

// Utility function: Format the class name to snake_case
function formatClassName(className: string): string {
  // Use a regular expression to convert camelCase or PascalCase to snake_case
  return className.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}