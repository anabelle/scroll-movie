/*! Scroll Movie JS */
$(document).ready(function(){

	// Movie Settings
	var stills = 10000;

	var $doc = $(document);
	var $win = $(window);

	// dimensions - we want to cache them on window resize
	var windowHeight, windowWidth;
	var fullHeight, scrollHeight;
	var streetImgWidth = 1024, streetImgHeight = 640;
	calculateDimensions();

	hashname = window.location.hash.substr(1);
	var currentPosition = -1, targetPosition = 0;
	var $videoContainer = $('.movie');
	var video = $('.movie > img')[0];
	var $hotspotElements = $('[data-position]');


	if( hashname ){
		window.scrollTo( 0, hashname );
		console.log( hashname );
	}

	// handling resize and scroll events
	
	function calculateDimensions() {
		windowWidth = $win.width();
		windowHeight = $win.height();
		fullHeight = $('#main').height();
		scrollHeight = fullHeight - windowHeight;
	}
	
	function handleResize() {
		calculateDimensions();
		resizeBackgroundImage();
		handleScroll();
	}

	function handleScroll() {
		targetPosition = $win.scrollTop() / scrollHeight;
	}
	
	// main render loop
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          window.oRequestAnimationFrame      ||
	          window.msRequestAnimationFrame     ||
	          function(/* function */ callback, /* DOMElement */ element){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();


	function animloop(){
		if ( Math.floor(currentPosition*5000) != Math.floor(targetPosition*5000) ) {
			currentPosition += (targetPosition - currentPosition) / 5;
			render(currentPosition);
		}
	  requestAnimFrame(animloop);
	}


	// rendering


	function render( position ) {
		// position the elements
		var minY = -windowHeight, maxY = windowHeight;
		$.each($hotspotElements,function(index,element){
			var $hotspot = $(element);
			var elemPosition = Number( $hotspot.attr('data-position') );
			var elemSpeed = Number( $hotspot.attr('data-speed') );
			var elemY = windowHeight/2 + elemSpeed * (elemPosition-position) * scrollHeight;
			if ( elemY < minY || elemY > maxY ) {
				$hotspot.css({'visiblity':'none', top: '-1000px','webkitTransform':'none'});
			} else {
				$hotspot.css({'visiblity':'visible', top: elemY, position: 'fixed'});
			}
		});
		
		
		renderVideo( position );
	}


	function resizeBackgroundImage(){
		// get image container size
		var scale = Math.max( windowHeight/streetImgHeight , windowWidth/streetImgWidth );
		var width = scale * streetImgWidth , height = scale * streetImgHeight;
		var left = (windowWidth-width)/2, top = (windowHeight-height)/2;
		$videoContainer
				  .width(width).height(height)
				  .css('position','fixed')
				  .css('left',left+'px')
				  .css('top',top+'px');
	}

	// video handling

	var imageSeqLoader = new ProgressiveImageSequence( "img/vid/still{index}.jpg" , stills , {
		indexSize: 4,
		initialStep: 1,
		onProgress: handleLoadProgress,
		onComplete: handleLoadComplete,
		stopAt: 1
	} );

	var loadCounterForIE = 0; // there seems to be a problem with ie calling the callback several times
	imageSeqLoader.loadPosition(currentPosition,function(){
		loadCounterForIE++;
		if ( loadCounterForIE == 1 ) {
			renderVideo(currentPosition);
			imageSeqLoader.load();
			imageSeqLoader.load();
			imageSeqLoader.load();
			imageSeqLoader.load();
		}
	});

	var currentSrc, currentIndex;

	function renderVideo(position) {
		var index = Math.round( currentPosition * (imageSeqLoader.length-1) );
		var img = imageSeqLoader.getNearest( index );
		var nearestIndex = imageSeqLoader.nearestIndex;
		if ( nearestIndex < 0 ) nearestIndex = 0;

		var $img = $(img);
		var src;
		if ( !!img ) {
			src = img.src;
			if ( src != currentSrc ) {
				video.src = src;
				currentSrc = src;
			}
		}
	}

	$('body').append('<div id="loading-bar" style="position:fixed; top:0; left:0; background-color: #CCC; background-color: rgba(223,0,18,0.5); height: 10px;"></div>');
	
	function handleLoadProgress() {
		var progress = imageSeqLoader.getLoadProgress() * 100;
		$('#loading-bar').css({width:progress+'%',opacity:1});
	}

	function handleLoadComplete() {
		$('#loading-bar').css({width:'100%',opacity:0});
	}

	$win.resize( handleResize );
	$win.scroll( handleScroll );

	handleResize();
	animloop();

	// Timed out events 

	var scrollTimeout;  // global for any pending scrollTimeout
			
	$win.scroll(function () {
		if (scrollTimeout) {
			// clear the timeout, if one is pending
			clearTimeout(scrollTimeout);
			scrollTimeout = null;
		}
		scrollTimeout = setTimeout(scrollHandler, 250);
	});

	scrollHandler = function () {
		window.location.hash = $win.scrollTop();
		if ( $win.innerHeight() + $win.scrollTop() >= $("body").height() ) {
			console.log("The End");
			window.scrollTo( 0, 0);
		}
	};

});