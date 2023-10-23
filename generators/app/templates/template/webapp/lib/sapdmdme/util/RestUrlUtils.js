sap.ui.define([

], function() {
    "use strict";

    // utils is a library of generic helper functions non-specific to axios

    function encode(val) {
        return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/\+/g, '%20').
        replace(/%5B/gi, '').
        replace(/%5D/gi, '');
    }

    return {
        /**
         * Determine if a value is an Array
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an Array, otherwise false
         */
        isArray: function isArray(val) {
            return Array.isArray(val);
        },

        /**
         * Determine if a value is an Object
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an Object, otherwise false
         */
        isObject: function(val) {
            return val !== null && typeof val === 'object';
        },

        /**
         * Determine if a value is a Date
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Date, otherwise false
         */
        isDate: function(val) {
            return val instanceof Date;
        },

        /**
         * Determine if a value is a URLSearchParams object
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a URLSearchParams object, otherwise false
         */
        isURLSearchParams: function(val) {
            return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
        },


        /**
         * Iterate over an Array or an Object invoking a function for each item.
         *
         * If `obj` is an Array callback will be called passing
         * the value, index, and complete array for each item.
         *
         * If 'obj' is an Object callback will be called passing
         * the value, key, and complete object for each property.
         *
         * @param {Object|Array} obj The object to iterate
         * @param {Function} fn The callback to invoke for each item
         */
        forEach: function(obj, fn) {
            // Don't bother if no value provided
            if (obj === null || typeof obj === 'undefined') {
                return;
            }

            // Force an array if not already something iterable
            if (typeof obj !== 'object' && !this.isArray(obj)) {
                /*eslint no-param-reassign:0*/
                obj = [obj];
            }

            if (this.isArray(obj)) {
                // Iterate over array values
                for (let i = 0, l = obj.length; i < l; i++) {
                    fn.call(null, obj[i], i, obj);
                }
            } else {
                // Iterate over object keys
                for (let key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        fn.call(null, obj[key], key, obj);
                    }
                }
            }
        },

        /**
         * Build a URL by appending params to the end
         *
         * @param {string} url The base of the url (e.g., http://www.google.com)
         * @param {object} [params] The params to be appended
         * @returns {string} The formatted url
         */
        buildURL: function(url, params, paramsSerializer) {
            let that = this;
            if (!params) {
                return url;
            }

            let serializedParams;
            if (paramsSerializer) {
                serializedParams = paramsSerializer(params);
            } else if (that.isURLSearchParams(params)) {
                serializedParams = params.toString();
            } else {
                let parts = [];

                that.forEach(params, function serialize(val, key) {
                    if (val === null || typeof val === 'undefined' || val === "") {
                        return;
                    }

                    if (!that.isArray(val)) {
                        val = [val];
                    }

                    that.forEach(val, function(v) {
                        v = that.parseValue(v);
                        parts.push(encode(key) + '=' + encode(v));
                    });
                });

                serializedParams = parts.join('&');
            }

            if (serializedParams) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
            }

            return url;
        },

        parseValue: function(v) {
            if (this.isDate(v)) {
                v = v.toISOString();
            } else if (this.isObject(v)) {
                v = JSON.stringify(v);
            }
            return v;
        }

    };
});