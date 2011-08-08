exports.Route = Route;

function Route(pattern, callback) {
    this.setPattern(pattern);
    this.setCallback(callback);
    this.setConditions();
}

Route.prototype = {
    pattern: null,
    setPattern: function(pattern) {
        this.pattern = pattern; 
    },
    setCallback: function(callback) {
        this.callback = callback; 
    },
    setConditions: function(conditions) {
        this.conditions = conditions || [];
    },
    setRouter: function(router) {
        this.router = router;
    },
    matches: function(resourseUri) {
        if (resourseUri === this.pattern) {
            return true;
        }

        if (!(this.pattern instanceof RegExp)) {
            var reg = new RegExp(this.pattern, 'i');
        }

        if ((reg || this.pattern).test(resourseUri)) {
            return true;
        }

        return false;
    },
    dispatch: function(req, res, out) {
        if (this.callback) {
            this.callback(req, res, out);
            return true;
        }
        return false;
    }
};
