$(document).ready(function() {

  $('#startGame').prop('disabled', true);
  $('#playCard').prop('disabled', true);
  $('#slap').prop('disabled', true);

  var socket = io();

  var user = null;

  socket.on('connect', function() {

    $('.connecting-container').hide();
    $('.main-container').show();
  });

  socket.on('username', function(data) {
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);

    $('#startGame').prop('disabled', false);
    $('#usernameDisplay').text('Joined game as ' + data.username);
    user = data;
  });

  socket.on('playCard', function(data) {
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
    $('#startGame').prop('disabled', true);
    $('#playCard').prop('disabled', false);
    $('#slap').prop('disabled', false);
  });

  socket.on('message', function(data) {
    $("#messages-container").append('<div id="message">'+data+'</div>');

    setTimeout(function(){
        $("#message").remove();
    }, 2000);
  });

  socket.on('clearDeck', function(){
    setTimeout(function(){

        document.getElementById("card").src=``;
    }, 500);

  });

  socket.on("updateGame", function(gameState) {
    if (gameState.isStarted) {
      $('#joinGame').prop('disabled', true);
      $('#observeGame').prop('disabled', true);

      if (!user) {
        $('#usernameDisplay').text('Observing game...');
      }
    }

    if (user) {
      $("#usernameDisplay").text('Playing as ' + user.username);
      $(".numCards").text(gameState.numCards[user.id] || 0);
    }

    $(".playerNames").text(gameState.playersInGame);

    if (gameState.isStarted) {
      $(".currentPlayerUsername").text(gameState.currentPlayerUsername + "'s turn");
    } else {
      $(".currentPlayerUsername").text('Game has not started yet.');
    }

    $("#pileDisplay").text(gameState.cardsInDeck + ' cards in pile');

    $(".num").show();

    if (gameState.win) {
      $('.main-container').hide();
      $('.connecting-container').text(gameState.win + ' has won the game!');
      $('.connecting-container').show();
    }
    window.state = gameState;
  })

  socket.on('disconnect', function() {
    window.location = window.location;
  });

  socket.on('observeOnly', function() {
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game...');
  })

  socket.on('errorMessage', function(data) {
    alert(data);
  })

  // Click handlers
  $('#startGame').on('click', function(e) {
    e.preventDefault();
    socket.emit('start');
  });

  $('#joinGame').on('click', function(e) {
    e.preventDefault();
    var userinput = prompt('Please enter username');
    socket.emit('username', userinput);
  });

  $('#observeGame').on('click', function(e) {
    e.preventDefault();
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game...');
  });

  $('#playCard').on('click', function(e) {
    e.preventDefault();
    console.log('here')
    socket.emit('playCard');
  });

  $('#slap').on('click', function(e) {
    e.preventDefault();
    socket.emit('slap');
  });

});
