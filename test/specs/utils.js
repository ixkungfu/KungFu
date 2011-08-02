var utils = require('../../lib/utils.js')

describe('Random Int', function(){
    console.log(utils.getRandomInt(1, 5));
    console.log(utils.getRandomInt(5, 50));
});


describe('Object instanceOf', function(){
    it('[] instanceof Array', function(){
        var t = utils.instanceOf([], Array);
        expect(t).toBeTruthy();
    });

    it('{} instanceof Array', function(){
        var t = utils.instanceOf({}, Array);
        expect(t).toBeFalsy();
    });

    it('{} instanceof Object', function(){
        var t = utils.instanceOf({}, Object);
        expect(t).toBeTruthy();
    });
});
