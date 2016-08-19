var data = [{
	id: 1,
	title: '告白气球（翻唱） - 周二珂',
	duration: 246,
	artists: ['二珂呀呀呀'],
	album: '',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 320, // 单位kbps
},{
	id: 2,
	title: '爱情废柴',
	duration: 380,
	artists: ['周杰伦'],
	album: '周杰伦的床边故事',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 128, // 单位kbps
},{
	id: 3,
	title: '告白气球',
	duration: 195,
	artists: ['周杰伦'],
	album: '周杰伦的床边故事',
	type: 'MP3',
	sampleRate: 44.1, // 单位khz赫兹
	bitRate: 320, // 单位kbps
}]

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var soundManager = require('soundmanager2').soundManager;

require('../css/webvox.less');
require('font-awesome/css/font-awesome.css');

var WebVox = React.createClass({
	getInitialState: function(){
		return {
			currentSongId: 1
		}
	},
	handleSwitchSong: function(id){
		this.setState({currentSongId: parseInt(id)});
	},
	render: function(){
		var currentSongId = this.state.currentSongId;
		var currentSong = _.find(this.props.data, function(song){return song.id === currentSongId}); 
		return (
			<div className="webVox">
				<div id="close"><i className="fa fa-times"></i></div>
				<VoxHeader song={currentSong} />
				<PlayList songs={this.props.data} handleSwitchSong={this.handleSwitchSong}/>
			</div>
		)
	}
});

var VoxHeader = React.createClass({
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
						<p className="title">{song.title}</p>
					</div>
				</div>
				<PlayBox />
			</div>
		)
	}
});

var PlayBox = React.createClass({
	componentDidMount: function(){

	},
	togglePlayList: function(e){
		var $target = $(e.currentTarget);
		$target.toggleClass('fa-compress').toggleClass('fa-expand');
		$('.playList').slideToggle();
	},
	render: function(){
		return (
			<div className="playBox">
				<div className="progressBar">
					<div className="total"></div>
					<div className="played"></div>
				</div>
				<ul>
					<li className="toggle"><i className="fa fa-compress" onClick={this.togglePlayList}></i></li>
					<li className="controls">
						<i className="fa fa-backward"></i>
						<i className="fa fa-play"></i>
						<i className="fa fa-forward"></i>
					</li>
					<li className="search"><i className="fa fa-search"></i></li>
				</ul>
			</div>
		)
	}
});

var PlayList = React.createClass({
	render: function(){
		var rows = this.props.songs.map(function(song, i){
			return (
				<SongRow song={song} index={i+1} key={song.id} handleSwitchSong={this.props.handleSwitchSong}/>
			)
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
		var minutes = (song.duration / 60).toFixed(0);
		minutes = minutes < 10 ? '0'+minutes : ''+minutes;
		var seconds = song.duration % 60;
		seconds = seconds < 10 ? '0'+seconds : ''+seconds;

		return (
			<li className="songRow" data-id={song.id} onDoubleClick={this.switchSong} onClick={this.activateSong}>
				<span className="index">{this.props.index}</span>
				<span className="songInfo">
					<span className="title">{song.title}</span>
					<span className="artists">{song.artists.toString()}</span>
					<span className="duration">{minutes}:{seconds}</span>
				</span>
			</li>	
		)
	}	
});

ReactDOM.render(<WebVox data={data}/>,
	document.getElementById('content')
);