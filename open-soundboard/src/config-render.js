const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const Binding = require('./Binding');
var bindings = require('./../data/binding-config.json');

// DOM Elements
var fileInput = document.getElementById('file-path-input');
var keybindInput = document.getElementById('keybind-input');
var keybindRecordButton = $('#keybind-record-button');

// Variables
var recordingKeybind = false;
var keyBuffer = [];

// convert a keyevent to a human readable string
function keyEventToReadableString(codedEvent) {
    // The first char is event.location
    switch (codedEvent.substring(0, 1)) {
        // Standard Location (a-z, 0-9, F keys, Space, Enter) 
        case '0':
            // If event.key is a single char
            if (codedEvent.substring(1).length === 1) {
                // Handle special case for plus
                if (codedEvent.substring(1) === '+') {
                    return 'Plus';
                } else {
                    return codedEvent.substring(1).toUpperCase();
                }
            } else {
                // Turn 'ArrowUp' into 'Up'
                if (codedEvent.substring(0, 5) === 'Arrow') {
                    return codedEvent.substring(5);
                } else {
                    // Handle some other bs that keyboards do
                    switch (codedEvent.substring(1)) {
                        case 'Help':
                            return 'Insert';
                        
                        case 'Clear':
                            return 'Numlock';
                    
                        default:
                            return codedEvent.substring(1);
                    }
                }
            }

        case '1':
        case '2':
            switch (codedEvent.substring(1)) {
                case 'Meta':
                    if (process.platform === 'darwin') {
                        return 'Cmd'
                    // } else if (process.platform === 'win32') {
                    //     return 'Win'
                    } else {
                        return 'Super'
                    }

                case 'Control':
                    return 'Ctrl';
            
                default:
                    return codedEvent.substring(1);
            }
            
        // // Keys on the left
        // case '1':
        //     return `L${codedEvent.substring(1)}`;

        // // Keys on the right
        // case '2':
        //     return `R${codedEvent.substring(1)}`;

        // Numpad Keys
        case '3':
            switch (codedEvent.substring(1)) {
                case '.':
                    return 'numdec'

                case '+':
                    return 'numadd'

                case '-':
                    return 'numsub'

                case '*':
                    return 'nummult'

                case '/':
                    return 'numdiv'

                case 'Enter':
                    return 'Enter';

                default:
                    return `num${codedEvent.substring(1)}`;
            }

        default:
            break;
    }
}

function replaceCmdCtrl() {
    accelString = keybindInput.value;
    if (process.platform === 'darwin') {
        
    }
}

function setButtonState(state) {
    recordingKeybind = state;
    // Toggle between btn-light and btn-danger
    keybindRecordButton.removeClass(`btn-${(state ? 'light' : 'danger')}`).addClass(`btn-${(state ? 'danger' : 'light')}`);
    if (recordingKeybind) {
        // Move focus to Keybind input box
        keybindInput.focus();

        startTime = new Date();
        document.addEventListener('keydown', (event) => {
            if (recordingKeybind) {
                event.preventDefault();
                let latestPressTime = Date.now();

                // Reset buffer if keypresses are more than 200ms apart
                if (latestPressTime - startTime > 200) {
                    keyBuffer = [];
                    keybindInput.value = "";
                }

                // Add keycode to the buffer
                keyBuffer.push(`${event.location}${(event.key === ' ' ? 'Space' : event.key)}`);
                startTime = latestPressTime;
                keyBuffer = keyBuffer.filter((value, index, self) => { return self.indexOf(value) === index; });


                for (const [index, element] of keyBuffer.entries()) {
                    if (index) {
                        keybindInput.value += `+${keyEventToReadableString(element)}`
                    } else {
                        keybindInput.value = `${keyEventToReadableString(element)}`
                    }
                }
            }
        });
    } else {
        // Remove duplicate keycodes


        console.log(keybindInput.value);
    }
}

if (!bindings) {
    $('#no-binds-msg').hide();
} else {
    $('#no-binds-msg').show();
}

document.getElementById('keybind-record-button').addEventListener('click', (ev) => {
    setButtonState(!recordingKeybind);
});

keybindInput.addEventListener('focusin', (ev) => {
    setButtonState(true);

});

document.getElementById('add-binding-button').addEventListener("click", () => {
    ipcRenderer.invoke('add-binding', 'bind data').then((res) => {
        console.log(res);
    });
    console.log('add button clicked')
});
