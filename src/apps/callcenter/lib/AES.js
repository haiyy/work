import { enc, AES, lib, mode, pad } from "crypto-js";

mode.ECB = function() {
	var a = lib.BlockCipherMode.extend();
	a.Encryptor = a.extend({
		processBlock: function(a, b) {
			this._cipher.encryptBlock(a, b)
		}
	});
	a.Decryptor = a.extend({
		processBlock: function(a, b) {
			this._cipher.decryptBlock(a, b)
		}
	});
	return a
}();

export function Encrypt(word)
{
	var key = enc.Utf8.parse("RgTw867hqCLAUw==");
	var srcs = enc.Utf8.parse(word);
	var encrypted = AES.encrypt(srcs, key, {mode: mode.ECB, padding: pad.Pkcs7});
	
	return encrypted.toString();
}

export function Decrypt(word)
{
	var key = enc.Utf8.parse("RgTw867hqCLAUw==");

	var decrypt = AES.decrypt(word, key, {mode: mode.ECB, padding: pad.Pkcs7});
	return enc.Utf8.stringify(decrypt)
	.toString();
}


