const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const Binding = require('./Binding');
var bindings = require('./../data/binding-config.json');

// DOM Elements
var fileInput = document.getElementById('file-path-input');
var keybindInput = document.getElementById('keybind-input');
var keybindRecordButton = $('#keybind-record-button')

// Variables
var recordingKeybind = false;


if (!bindings) {
    $('#no-binds-msg').hide();
} else {
    $('#no-binds-msg').show();
}

document.getElementById('keybind-record-button').addEventListener('click', (ev) => {
    if (recordingKeybind) {
        recordingKeybind = false;
        keybindRecordButton.removeClass('btn-danger').addClass('btn-light');
        // keybindRecordButton.html("Record");
    } else {
        recordingKeybind = true;
        keybindRecordButton.removeClass('btn-light').addClass('btn-danger');
        // keybindRecordButton.html("  Stop ");
    }
    
});

document.getElementById('add-binding-button').addEventListener("click", () => {
    ipcRenderer.invoke('add-binding', 'bind data').then((res) => {
        console.log(res);
    });
    console.log('add button clicked')
});
