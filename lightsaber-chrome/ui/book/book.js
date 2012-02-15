define([],
      function() {
	  $('#magazine').bind('turned', function(e, page) {
				  console.log('Current view: ', $('#magazine').turn('view'));
			      });
	  $('#magazine').turn({page:1, shaows:true, acceleration:true});
	  $('#next').bind('click', function() { $('#magazine').turn('next'); });
	  $('#prev').bind('click',  function() {  $('#magazine').turn('previous'); });
	  // make some sleep charts
	  $.plot($("#sleepgraph"),
		 [{
                     data: [[0,1],[1,2],[2,6],[3,3],[4,4]],
                     bars:{ show:true }
                 }]);
	  $('#magazine').turn('next'); 	  
      });