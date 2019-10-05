$(document).ready(function() {

  //When the game page loads, we want these three butttons to be disabled
  $('#startGame').prop('disabled', true);
  $('#playCard').prop('disabled', true);
  $('#slap').prop('disabled', true);

  // Sets up environment for socket.io
  var socket = io();

  // initialize user, to be updated later
  var user = null;

  socket.on('connect', function() {

    // hide the loading container and show the main container
    $('.connecting-container').hide();
    $('.main-container').show();
  });

  socket.on('username', function(data) {
    // YOUR CODE HERE
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);

    $('#startGame').prop('disabled', false);
    $('#usernameDisplay').text('Joined game as ' + data.username);
    user = data;
  });

  socket.on('playCard', function(data) {
    // YOUR CODE HERE
    var value = data.card.value;

    if (data.card.value == 1) {
      value = 'ace'
    } else if (data.card.value == 11) {
      value = 'jack'
    } else if (data.card.value == 12) {
      value = 'queen'
    } else if (data.card.value == 13) {
      value = 'king'
    }


    document.getElementById("card").src=`./cards/${value}_of_${data.card.suit}.svg`;
  });

  socket.on('start', function() {
    // YOUR CODE HERE
    $('#startGame').prop('disabled', true);
    $('#playCard').prop('disabled', false);
    $('#slap').prop('disabled', false);
  });

  socket.on('message', function(data) {
    // YOUR CODE HERE
    console.log('in message')
    $("#messages-container").append('<div id="message">'+data+'</div>');

    setTimeout(function(){

        $("#message").remove();
    }, 2000);
  });

  socket.on('clearDeck', function(){
    // YOUR CODE HERE
    console.log('here in clearDeck');
    setTimeout(function(){

        document.getElementById("card").src=``;
    }, 500);

  });

  socket.on("updateGame", function(gameState) {
    // If game has started, disable join buttons
    if (gameState.isStarted) {
      $('#joinGame').prop('disabled', true);
      $('#observeGame').prop('disabled', true);

      // If game has started and user is undefined, he or she must be an observer
      if (!user) {
        $('#usernameDisplay').text('Observing game...');
      }
    }

    // Displays the username and number of cards the player has
    if (user) {
      $("#usernameDisplay").text('Playing as ' + user.username);
      $(".numCards").text(gameState.numCards[user.id] || 0);
    }

    // Shows the players who are currently playing
    $(".playerNames").text(gameState.playersInGame);

    // Displays the current player
    if (gameState.isStarted) {
      $(".currentPlayerUsername").text(gameState.currentPlayerUsername + "'s turn");
    } else {
      $(".currentPlayerUsername").text('Game has not started yet.');
    }

    // Displays the number of cards in the game pile
    $("#pileDisplay").text(gameState.cardsInDeck + ' cards in pile');

    $(".num").show();

    // If the game is in a winning state, hide everything and show winning message
    if (gameState.win) {
      $('.main-container').hide();
      $('.connecting-container').text(gameState.win + ' has won the game!');
      $('.connecting-container').show();
    }
    window.state = gameState;
  })

  socket.on('disconnect', function() {
    // refresh on disconnect
    window.location = window.location;
  });

  // This handler is called when a player joins an already started game
  socket.on('observeOnly', function() {
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game...');
  })

  // A handler for error messages
  socket.on('errorMessage', function(data) {
    alert(data);
  })

  // ==========================================
  // Click handlers
  // ==========================================
  $('#startGame').on('click', function(e) {
    e.preventDefault();
    // YOUR CODE HERE
    console.log('after pd')

    socket.emit('start');
  });

  $('#joinGame').on('click', function(e) {
    e.preventDefault();
    // YOUR CODE HERE
    var userinput = prompt('Please enter username');
    socket.emit('username', userinput);
  });

  $('#observeGame').on('click', function(e) {
    e.preventDefault();
    // YOUR CODE HERE
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game...');
  });

  $('#playCard').on('click', function(e) {
    e.preventDefault();
    // YOUR CODE HERE
    console.log('here')
    socket.emit('playCard');
  });

  $('#slap').on('click', function(e) {
    e.preventDefault();
    // YOUR CODE HERE
    socket.emit('slap');
  });

});
