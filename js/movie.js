/*! Scroll Movie JS */
$(document).ready(function(){

	// Ignoramos el scroll del mouse

	$(document).bind("mousewheel", function() {
		return false;
	});

	// Mapeamos left y right a up y down
	$(document).keydown(function(e){
		console.log( e.keyCode );
    	// left arrow
	    if ((e.keyCode || e.which) == 37 || (e.keyCode || e.which) == 38 )
	    {   
	    	e.preventDefault();
	    	window.scrollTo(0, $(document).scrollTop() - 30);	    
	    }
	    // right arrow
	    if ((e.keyCode || e.which) == 39 || (e.keyCode || e.which) == 40 )
	    {
	    	e.preventDefault();
	    	window.scrollTo(0, 30 + $(document).scrollTop()); 
	   	}   
	});

	// Movie Settings
	var stills = 10075;

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


	// handling resize and scroll events

	function locateFrames() {
		var frameWidth = 720;// $('.movie > img').outerWidth();
		var frameHeight = 405;
		var padFrame = ( windowWidth - frameWidth ) / 2;
		var padFrameTop = ( windowHeight - frameHeight ) / 2;
		$('.movie > img').css( 'left', padFrame ).css( 'top', padFrameTop );
	}
	locateFrames();
	
	function calculateDimensions() {
		windowWidth = $win.width();
		windowHeight = $win.height();
		fullHeight = $('#main').height();
		scrollHeight = fullHeight - windowHeight;
	}
	
	function handleResize() {
		calculateDimensions();
		resizeBackgroundImage();
		locateFrames();
		handleScroll();
	}

	function handleScroll() {
		targetPosition = $win.scrollTop() / scrollHeight;
		// console.log( targetPosition );
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
		if ( Math.floor(currentPosition*10000) != Math.floor(targetPosition*10000) ) {
			currentPosition += (targetPosition - currentPosition) / 10;
			render(currentPosition);
		}
	  requestAnimFrame(animloop);
	  // console.log( requestAnimFrame );
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
		indexSize: 5,
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

	$('body').append('<div id="loading-bar" style="position:fixed; top:0; left:0; background-color: #EB9FB0; background-color: rgba(235,159,176,1); height: 15px;"></div>');
	
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
		scrollTimeout = setTimeout(scrollHandler, 100);
	});

	scrollHandler = function () {
		// window.location.hash = currentPosition;
		if ( $win.innerHeight() + $win.scrollTop() >= $("body").height() ) {
			window.scrollTo( 0, 0);
			console.log("The End");
		}
	};

	if( hashname ){
		targetPosition = hashname;
		currentPosition = targetPosition-1;
		// window.scrollTo( targetPosition * 1000 );
		animloop();
		console.log( hashname );
	}

});
