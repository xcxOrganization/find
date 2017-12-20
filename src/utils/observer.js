function Observer(type) {
    if (this instanceof Observer) {
        this.type = '';
        this.list = [];
        if (type) {
            this.type = type;
            if (type === 'fn') {
                return _fnObserver
            }
        }
    } else {
        return new Observer(type)
    }
}

Observer.prototype.Add = function (obj) {
    return this.list.push(obj);
};

Observer.prototype.RemoveIndexAt = function (index) {
    this.list.splice(index, 1);
};

Observer.prototype.Count = function () {
    return this.list.length;
};

Observer.prototype.Get = function (index) {
    if (index > -1 && index < this.list.length) {
        return this.list[index];
    }
};

Observer.prototype.Updata = function () {
    let list = this.list;
    while (list && list.length > 0) {
        let obj = list.shift();
        if (typeof obj == 'function') {
            obj();
        } else {
            return obj;
        }
    }

};

let _fnObserver = new Observer('fn');

module.exports = Observer;
