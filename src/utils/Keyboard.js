var keyCodes = [// the ultimate list of keycodes
	'Unknown', 'Mouse1', 'Mouse2', 'Break', 'Mouse3', 'Mouse4', 'Mouse5', '', 'Backspace', 'Tab', '', '',
	'Clear', 'Enter', '', '', 'Shift', 'Control', 'Alt', 'Pause', 'CapsLock', 'IMEHangul', '',
	'IMEJunja', 'IMEFinal', 'IMEKanji', '', 'Escape', 'IMEConvert', 'IMENonconvert', 'IMEAccept',
	'IMEModechange', 'Space', 'PageUp', 'PageDown', 'End', 'Home', 'Left', 'Up', 'Right', 'Down',
	'Select', 'Print', 'Execute', 'PrintScreen', 'Insert', 'Delete', 'Help', '0', '1', '2', '3', '4',
	'5', '6', '7', '8', '9', '', '', '', '', '', '', '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
	'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'OSLeft', 'OSRight', 'MetaExtra', '', 'Sleep', '0', '1', '2', '3',
	'4', '5', '6', '7', '8', '9', '1', '+',
	'Enter', '-', '.', '/', 'F1', 'F2', 'F3', 'F4', 'F5',
	'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19',
	'F20', 'F21', 'F22', 'F23', 'F24', '', '', '', '', '', '', '', '', 'NumLock', 'ScrollLock', '',
	'', '', '', '', '', '', '', '', '', '', '', '', '', 'ShiftLeft', 'ShiftRight', 'ControlLeft',
	'ControlRight', 'AltLeft', 'AltRight', 'BrowserBack', 'BrowserForward', 'BrowserRefresh',
	'BrowserStop', 'BrowserSearch', 'BrowserFavorites', 'BrowserHome', 'VolumeMute', 'VolumeDown',
	'VolumeUp', 'MediaNextTrack', 'MediaPrevTrack', 'MediaStop', 'MediaPlayPause', 'LaunchMail',
	'SelectMedia', 'LaunchApplication1', 'LaunchApplication2', '', '', ';', '=', ',', '-', '.', '/',
	'~', 'DeadAcute', 'DeadCircumflex', 'DeadTilde', 'DeadMacron', 'DeadBreve', 'DeadAboveDot',
	'DeadUmlaut', 'DeadAboveRing', 'DeadDoubleAcute', 'DeadCaron', '', '', '', '', '', '', '', '',
	'', '', '', '', 'DeadCedilla', 'DeadOgonek', '', '', '[', '\\', ']', '\\', 'Meta', 'Meta', '',
	'AltGr', '', '', 'CapsLock', '', '0x00', '', '', '', '', '', '', '', '', '', '', '', '', '',
	'', 'Attention', 'Crsel', 'Exsel', 'EraseEOF', 'Play', 'Zoom', 'NoName', '', 'Clear', ''];

class Keyboard {
	static ESC = 27;
	static ENTER = 13;
	static TAB = 9;
	static LEFT = 37;
	static RIGHT = 39;
	static UP = 38;
	static DOWN = 40;
	
	static C = 67;
	static V = 86;
	static X = 88;
	
	constructor()
	{
	
	}
	
	//value === keyCode
	static getKeyName(value)
	{
		return keyCodes[value];
	}
}

export default Keyboard;