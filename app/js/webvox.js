var data = [{
	id: 1,
	title: '告白气球（翻唱） - 周二珂',
	duration: 213263,
	artists: ['二珂呀呀呀'],
	album: '',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 320, // 单位kbps
	name: '二珂呀呀呀 - 告白气球（翻唱） - 周二珂.mp3'
},{
	id: 2,
	title: '爱情废柴',
	duration: 285648,
	artists: ['周杰伦'],
	album: '周杰伦的床边故事',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 128, // 单位kbps
	name: '周杰伦 - 爱情废柴.mp3'
},{
	id: 3,
	title: '告白气球',
	duration: 215196,
	artists: ['周杰伦'],
	album: '周杰伦的床边故事',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 320, // 单位kbps
	name: '周杰伦 - 告白气球.mp3'
}]


var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var VoxUtil = require('./util.js');
var soundManager = require('soundmanager2').soundManager;

require('../css/webvox.less');
require('font-awesome/css/font-awesome.css');

// Question: 当url为'../audio/11.mp3'时，作为参数传入require中（动态加载模块）报错，但为'./11.mp3'不报错，直接传路径不报错（静态加载），
// 只将后面name作为参数时，两个点的也不报错


/* 领悟：
	1. 所有和state有关的事物我们重新render就是了，而且只关心和这个state有关的DOM，不用手动改class
	2. 子元素要改父元素的state目前只能通过回调函数，然后父元素setState后，子元素相关DOM会重刷，一来一回
*/
var WebVox = React.createClass({
	getInitialState: function(){
		return {
			currentSongId: 1,
			isPlaying: false,
			isPlayFromBegin: true
		}
	},
	handleSwitchSong: function(id){
		this.setState({currentSongId: parseInt(id), isPlaying: true, isPlayFromBegin: true});
	},
	togglePlayingState: function(){
		var isPlaying = this.state.isPlaying ? false : true;
		this.setState({isPlaying: isPlaying, isPlayFromBegin: false});
	},
	render: function(){
		var currentSongId = this.state.currentSongId;
		var currentSong = _.find(this.props.data, function(song){return song.id === currentSongId}); 
		return (
			<div className="webVox">
				<div id="close"><i className="fa fa-times"></i></div>
				<VoxHeader song={currentSong} togglePlayingState={this.togglePlayingState} {...this.state} />
				<PlayList songs={this.props.data} handleSwitchSong={this.handleSwitchSong} {...this.state} />
			</div>
		)
	}
});

var VoxHeader = React.createClass({
	getInitialState: function(){
		return {
			volume: 50,
			currentTime: 0
		}
	},
	componentWillMount: function(){
		// 其实不用在这里设置audio，这里一个audio可以看成一个音频输出口，可以使用soundManager通过id来获取
		var that = this;
		soundManager.getSoundById('audio').options.whileplaying = function(){
			that.setState({currentTime: this.position});
		}
	},
	setPosition: function(mouseOffset, total){
		var duration = this.props.song.duration;
		var position = ~~duration * mouseOffset / total;
		var audio = soundManager.getSoundById('audio');
		audio.setPosition(position);
	},
	render: function(){
		var song = this.props.song;
		return (
			<div className="voxHeader">
				<div className="info">
					<div className="sampleInfo">
						<ul>
							<li>{song.type}</li>
							<li>{song.bitRate}kbps</li>
							<li>{song.sampleRate}kHz</li>
						</ul>
					</div>
					<div className="basicInfo">
						<p className="artists">{song.artists.toString()}</p>
						<p className="album">{song.album}</p>
						<span className="title">{song.title}</span>
						<span className="remainTime">-{VoxUtil.formatMilliseconds(song.duration - this.state.currentTime)}</span>
					</div>
				</div>
				<PlayBox currentTime={this.state.currentTime} setPosition={this.setPosition} {...this.props} />
			</div>
		)
	}
});

var PlayBox = React.createClass({
	toggle: function(e){
		var $target = $(e.currentTarget);
		var audio = soundManager.getSoundById('audio');
		if ($target.hasClass('fa-pause')){
			audio.pause();
		} else {
			audio.play();
		}
		this.props.togglePlayingState();
	},
	componentWillReceiveProps: function(nextProps){
		var audio = soundManager.getSoundById('audio')
		var song = nextProps.song;
		var isPlaying = nextProps.isPlaying;
		var isPlayFromBegin = nextProps.isPlayFromBegin;
		var currentTime = nextProps.currentTime;
		// console.log('this.props:',this.props);
		// console.log('nextProps:',nextProps);
		// 应对点击暂停/播放按钮和双击切歌的不同场景
		if ((isPlaying && this.props.currentTime === currentTime && isPlayFromBegin) || currentTime === 0){
			var audioUrl = require('../audio/'+song.name);
			audio.stop();
			audio.play({url: audioUrl});	
		}
	},
	togglePlayList: function(e){
		var $target = $(e.currentTarget);
		$target.toggleClass('fa-compress').toggleClass('fa-expand');
		$('.playList').slideToggle();
	},
	render: function(){
		var audio = soundManager.getSoundById('audio');
		var percentage = (this.props.currentTime / audio.duration * 100).toFixed(2) + '%';
		var togglePlay = this.props.isPlaying ? 
			<i className="togglePlay fa fa-pause" onClick={this.toggle}></i> :
			<i className="togglePlay fa fa-play" onClick={this.toggle}></i>;
		return (
			<div className="playBox">
				<ProgressBar percentage={percentage} setPosition={this.props.setPosition}/>
				<ul>
					<li className="toggle"><i className="fa fa-compress" onClick={this.togglePlayList}></i></li>
					<li className="controls">
						<i className="fa fa-backward"></i>
						{togglePlay}
						<i className="fa fa-forward"></i>
					</li>
					<li className="search"><i className="fa fa-search"></i></li>
				</ul>
			</div>
		)
	}
});

var ProgressBar = React.createClass({
	shouldComponentUpdate: function(nextProps){  // 在进度条按住拖动的时候，并不改变真正的currentTime的state，音乐继续播放，但进度条得我自己掌控
		if (this.isAdjusting){
			return false;
		} else {
			return true;
		}
	},
	preMoveStick: function(e){
		var $target = $(e.currentTarget);
		var $stick = $target.find('.stick');
		$stick.addClass('show');
		this.moveStick(e);
		this.startMoveMode();
	},
	startMoveMode: function(){
		this.isAdjusting = true;
		var $vox = $('.webVox');
		var $fake = $('<div class="fake"></div>');
		$fake.css({
			width: $vox.width(),
			height: $vox.height()
		});
		$vox.append($fake);
		$fake.on('mousemove', this.moveStick);
		$fake.on('mouseup', this.setPosition);
	},
	moveStick: function(e){
		var $vox = $('.webVox');
		var $target = $(e.currentTarget);
		var $stick = $vox.find('.stick');
		e = e.nativeEvent || e; // 想日狗
		this.mouseOffset = e.layerX || e.offsetX;  
		this.stickOffset = $stick[0].offsetLeft;
		this.total =  $target.width();
		console.log('mouseOffset:', this.mouseOffset, ' total:', this.total);
		var percentage = (this.mouseOffset / this.total * 100).toFixed(2) + '%';
		$vox.find('.played').css({width: percentage});	
	},
	setPosition: function(e){
		var $target = $(e.currentTarget);
		this.props.setPosition(this.mouseOffset, this.total);
		this.endMoveMode();
	},
	endMoveMode: function(){
		var $vox = $('.webVox');
		var $fake = $vox.find('.fake');
		var $progressBar = $vox.find('.progressBar');
		var $stick = $vox.find('.stick');
		$stick.removeClass('show');
		$vox.remove('.fake');
		$fake.off('mousemove');
		$fake.off('mouseup');
		$fake.remove();
		// Todo: 恢复stick
		this.isAdjusting = false;
	},
	showStick: function(e){
		var $target = $(e.currentTarget);
		$target.find('.stick').fadeIn(200);
	},
	hideStick: function(e){
		var $target = $(e.currentTarget);
		$target.find('.stick').fadeOut(200);
	},
	render: function(){
		return (
			<div className="progressBar" onMouseDown={this.preMoveStick} onMouseEnter={this.showStick} onMouseLeave={this.hideStick}>
				<div className="total"></div>
				<div className="played" style={{width: this.props.percentage}}>
					<div className="stick"></div>
				</div>
			</div>
		)
	}		
});

var PlayList = React.createClass({
	render: function(){
		var rows = this.props.songs.map(function(song, i){
			if (song.id == this.props.currentSongId){
				return (
					<SongRow song={song} index={i+1} key={song.id} isPlaying={this.props.isPlaying} handleSwitchSong={this.props.handleSwitchSong}/>
				)	
			} else {
				return (
					<SongRow song={song} index={i+1} key={song.id} handleSwitchSong={this.props.handleSwitchSong}/>
				)
			}
		}.bind(this))
		return (
			<ul className="playList">{rows}</ul>
		) 	
	}	
});

var SongRow = React.createClass({
	switchSong: function(e){
		var $target = $(e.currentTarget);
		var currentSongId = $target.attr('data-id');
		this.props.handleSwitchSong(currentSongId);
	},
	activateSong: function(e){
		var $target = $(e.currentTarget);
		$target.siblings().removeClass('active');
		$target.addClass('active');
	},
	render: function(){
		var song = this.props.song;
		var songInfo = (
			<span className="songInfo">
				<span className="title">{song.title}</span>
				<span className="artists">{song.artists.toString()}</span>
				<span className="duration">{VoxUtil.formatMilliseconds(song.duration)}</span>
			</span>
		);
		if (this.props.isPlaying === undefined){
			return (
				<li className="songRow" data-id={song.id} onDoubleClick={this.switchSong} onClick={this.activateSong}>
					<span className="index">{this.props.index}</span>
					{songInfo}
				</li>	
			)
		} else if (this.props.isPlaying){
			return (
				<li className="songRow active" data-id={song.id} onDoubleClick={this.switchSong} onClick={this.activateSong}>
					<span className="index">Y</span>
					{songInfo}
				</li>	
			)
		} else {
			return (
				<li className="songRow active" data-id={song.id} onDoubleClick={this.switchSong} onClick={this.activateSong}>
					<span className="index">N</span>
					{songInfo}
				</li>	
			)
		}
	}	 
});

// setup soundManager first!!
soundManager.setup({
	onready: function(){
		soundManager.createSound({id: 'audio'});
		ReactDOM.render(<WebVox data={data}/>,document.getElementById('content'));
	}
});

