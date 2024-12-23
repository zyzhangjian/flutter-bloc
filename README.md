# Flutter Bloc - New Bloc Template

**Flutter Bloc - New Bloc Template** is a Visual Studio Code extension designed to simplify the creation of Bloc structure files for Flutter applications. With this extension, developers can generate well-structured Bloc files (Bloc, Event, and State) with predefined templates in just a few clicks.

---

## Features

- **Generate Bloc Template Files**  
  Quickly generate the following files for your Flutter Bloc pattern:
  - `class_name_bloc.dart`
  - `class_name_event.dart`
  - `class_name_state.dart`

- **Automated Folder and File Naming**  
  The extension creates a new folder based on the class name you input, formats the folder and file names to follow the `snake_case` naming convention, and ensures that the Dart class names follow `PascalCase` naming convention.

- **Right-Click Context Menu**  
  Simply right-click on a folder in the file explorer, choose the command, input your desired class name, and let the extension handle the rest.

---

## How to Use

1. Install the extension in Visual Studio Code.
2. Open the file explorer in VS Code.
3. Right-click on the folder where you want to create the Bloc files.
4. Select the **Flutter Bloc: New Bloc Template** option from the context menu.
5. Enter the class name when prompted (e.g., `CreateName`).
6. The extension will:
   - Create a new folder named `create_name`.
   - Generate the following files inside the folder:
     - `create_name_bloc.dart`
     - `create_name_event.dart`
     - `create_name_state.dart`.

---

## Example

If you enter the class name `UserProfile`, the extension will:

1. Create a folder named `user_profile`.
2. Generate the following files:
   - `user_profile_bloc.dart`
   - `user_profile_event.dart`
   - `user_profile_state.dart`.
3. Populate the files with the following structure:
   - **Bloc File (`user_profile_bloc.dart`)**
     ```dart
     import 'package:bloc/bloc.dart';
     
     import 'user_profile_event.dart';
     import 'user_profile_state.dart';
     
     class UserProfileBloc extends Bloc<UserProfileEvent, UserProfileState> {
       UserProfileBloc() : super(UserProfileState()) {
         on<InitEvent>(_init);
       }
     
       void _init(InitEvent event, Emitter<UserProfileState> emit) async {
         emit(state.clone());
       }
     }
     ```
   - **Event File (`user_profile_event.dart`)**
     ```dart
     abstract class UserProfileEvent {}
     
     class InitEvent extends UserProfileEvent {}
     ```
   - **State File (`user_profile_state.dart`)**
     ```dart
     class UserProfileState {
       UserProfileState clone() {
         return UserProfileState();
       }
     }
     ```

---

## Requirements

- Visual Studio Code: Version 1.0 or later.
- Flutter SDK: Installed and configured.

---

## Known Issues

- The command only works when you right-click on a folder in the file explorer.
- Ensure that the class name follows Dart's naming conventions.

---

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---

## Feedback and Contributions

If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the project's GitHub repository.
