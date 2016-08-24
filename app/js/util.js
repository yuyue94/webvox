module.exports = {
	formatMilliseconds: function(milliseconds){
		if (milliseconds < 0){
			milliseconds = 0;
		}
		var hours = Math.floor(milliseconds / 3600000);
		milliseconds = milliseconds % 3600000;
		var minutes = Math.floor(milliseconds / 60000);
		milliseconds = milliseconds % 60000;
		var seconds = Math.floor(milliseconds / 1000);
		milliseconds = Math.floor(milliseconds % 1000);

		return (hours > 0 ? hours + ':' : '') +
		(minutes < 10 ? '0' : '') + minutes + ':' +
		(seconds < 10 ? '0' : '') + seconds
		// + ':' + (milliseconds < 100 ? '0' : '') + (milliseconds < 10 ? '0' : '') + milliseconds;	
	}
}