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
var WebVox = React.createClass({
	getInitialState: function(){
		return {
			currentSongId: 1,
			isPlaying: false
		}
	},
	handleSwitchSong: function(id){
		this.setState({currentSongId: parseInt(id), isPlaying: true});
	},
	togglePlayingState: function(){
		var isPlaying = this.state.isPlaying ? false : true;
		this.setState({isPlaying: isPlaying});
	},
	render: function(){
		var currentSongId = this.state.currentSongId;
		var currentSong = _.find(this.props.data, function(song){return song.id === currentSongId}); 
		return (
			<div className="webVox">
				<div id="close"><i className="fa fa-times"></i></div>
				<VoxHeader song={currentSong} isPlaying={this.state.isPlaying} togglePlayingState={this.togglePlayingState}/>
				<PlayList currentSongId={this.state.currentSongId} songs={this.props.data} isPlaying={this.state.isPlaying} handleSwitchSong={this.handleSwitchSong}/>
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
		var that = this;
		var song = this.props.song;
		var audioUrl = require('../audio/'+song.name);
		this.audio = soundManager.createSound({
			id: 'audio',
			url: audioUrl,
			whileloading: function(){
				console.log(VoxUtil.formatMilliseconds(this.durationEstimate));
			},
			whileplaying: function() {
				that.setState({currentTime: this.position});
			},
			onload: function(){
				console.log(VoxUtil.formatMilliseconds(this.duration));
			}
		})
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
						<span className="remainTime">- {VoxUtil.formatMilliseconds(song.duration - this.state.currentTime)}</span>
					</div>
				</div>
				<PlayBox song={this.props.song} audio={this.audio} isPlaying={this.props.isPlaying} togglePlayingState={this.props.togglePlayingState} currentTime={this.state.currentTime}/>
			</div>
		)
	}
});

var PlayBox = React.createClass({
	toggle: function(e){
		var $target = $(e.currentTarget);
		if ($target.hasClass('fa-pause')){
			this.props.audio.pause();
		} else {
			this.props.audio.play();
		}
		this.props.togglePlayingState();
	},
	componentWillReceiveProps: function(nextProps){
		var audio = nextProps.audio;
		var song = nextProps.song;
		var isPlaying = nextProps.isPlaying;
		var audioUrl = require('../audio/'+song.name);
		if (song.id !== this.props.song.id && isPlaying){
			audio.play({url: audioUrl});	
		}
	},
	togglePlayList: function(e){
		var $target = $(e.currentTarget);
		$target.toggleClass('fa-compress').toggleClass('fa-expand');
		$('.playList').slideToggle();
	},
	test: function(){
		var audioUrl = require('../audio/周杰伦 - 爱情废柴.mp3');
		this.props.audio.play({url: audioUrl});
	},
	render: function(){
		var percentage = (this.props.currentTime / this.props.audio.duration * 100).toFixed(2) + '%';
		var togglePlay = this.props.isPlaying ? 
			<i className="togglePlay fa fa-pause" onClick={this.toggle}></i> :
			<i className="togglePlay fa fa-play" onClick={this.toggle}></i>;
		return (
			<div className="playBox">
				<ProgressBar percentage={percentage}/>
				<ul>
					<li className="toggle"><i className="fa fa-compress" onClick={this.togglePlayList}></i></li>
					<li className="controls">
						<i className="fa fa-backward"></i>
						{togglePlay}
						<i className="fa fa-forward" onClick={this.test}></i>
					</li>
					<li className="search"><i className="fa fa-search"></i></li>
				</ul>
			</div>
		)
	}
});

var ProgressBar = React.createClass({
	preMoveStick: function(e){
		var $target = $(e.currentTarget)
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
			<div className="progressBar" onMouseEnter={this.showStick} onMouseLeave={this.hideStick}>
				<div className="total"></div>
				<div className="played" style={{width: this.props.percentage}}>
					<div className="stick" onMouseDown={this.preMoveStick}></div>
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
		ReactDOM.render(<WebVox data={data}/>,document.getElementById('content'));
	}
});

