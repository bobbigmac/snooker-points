
var maxCounts = { red: 15, color: 6 };
var balls = ['red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];

Session.setDefault('countOf_red', maxCounts['red']);
Session.setDefault('countOf_color', maxCounts['color']);

Template.colorActions.helpers({
  colors: function() {
    return [{ color: 'red', name: 'Reds' }, { color: 'color', name: 'Colors' }];
  },
  remaining: function() {
    var reds = Session.get('countOf_red');
    var colors = Session.get('countOf_color');
    var maxBallScore = 7;

    var disabledBalls = balls.map(function(name) { return !!Session.get('ballDisabled_'+name); });
    var availableColorScore = (disabledBalls.lastIndexOf(false) + 1) || maxBallScore;
    
    var colorScore = 0;
    for(var i = 0; i < colors; i++) {
      colorScore += (maxBallScore - i);
    }
    return (reds * (availableColorScore+1)) + colorScore;
  },
  balls: function() {
    return balls.map(function(name) {
      return { name: name };
    });
  }
});

Template.ball.helpers({
  ballAvailable: function(ball) {
    var reds = Session.get('countOf_red');
    var colors = Session.get('countOf_color');
    if(ball === 'red') {
      return !!reds;
    } else {
      var index = balls.indexOf(ball);
      if(index >= (balls.length - colors)) {
        return true;
      }
    }
    return false;
  },
  ballDisabled: function(ball) {
    return Session.get('ballDisabled_'+ball);
  }
});

Template.ball.events({
  'click .ball': function(e, t) {
    if(this.name !== 'red') {
      Session.set('ballDisabled_'+this.name, !Session.get('ballDisabled_'+this.name));
    }
  }
})

Template.colorActions.rendered = function() {
  $(window).off('keydown').on('keydown', function(e) {
    var direction = false;
    if(e.which === 37) {
      direction = -1;
    }
    if(e.which === 39) {
      direction = 1;
    }
    var redCount = Session.get('countOf_red');
    var colorCount = Session.get('countOf_color');
    if(direction) {
      if(redCount > 0 || (colorCount === maxCounts['color'] && direction === 1)) {
        if(direction === -1 || redCount < maxCounts['red']) {
          Session.set('countOf_red', redCount + direction);
          Session.set('countOf_color', maxCounts['color']);
        }
      } else {
        if((direction === 1 && colorCount < maxCounts['color']) || (direction === -1 && colorCount > 1)) {
          Session.set('countOf_color', colorCount + direction);
        }
      }
    }

    if(e.which === 38) {
      if(colorCount < maxCounts['color']) {
        Session.set('countOf_color', maxCounts['color']);
      } else if(redCount < maxCounts['red']) {
        Session.set('countOf_red', maxCounts['red']);
      }
    } else if(e.which === 40) {
      if(redCount > 0) {
        Session.set('countOf_red', 0);
      } else if(colorCount > 1) {
        Session.set('countOf_color', 1);
      }
    }
  });
};

Template.ballActions.helpers({
  count: function () {
    return Session.get('countOf_'+this.color);
  },
  isZero: function(e) {
    var currCount = Session.get('countOf_'+this.color);
    return !currCount;
  },
  isMax: function(e) {
    var currCount = Session.get('countOf_'+this.color);
    return currCount === maxCounts[this.color];
  }
});

Template.ballActions.events({
  'click button': function (e, t) {
    var data = $(e.currentTarget).data();
    var direction = (data && data.direction) || 0;
    if(typeof direction === 'string') {
      direction = parseInt(direction);
    }
    var color = this.color;
    if(direction && (color === 'red' || color === 'color')) {
      var currCount = Session.get('countOf_'+color);

      if(direction > 0 && currCount < maxCounts[color]) {
        currCount++;
      }
      else if(direction < 0 && currCount > 0) {
        currCount--;
      }
      
      if(currCount || currCount === 0) {
        if(color == 'red' && currCount) {
          Session.set('countOf_color', maxCounts['color']);
        }
        else if(color == 'color' && currCount < maxCounts['color']) {
          Session.set('countOf_red', 0);
        }
        Session.set('countOf_'+color, currCount);
      }
    }
  }
});