/*!
 * relay        module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/relay
 * @license     MIT
 * @version     0.1.0
 */

/*jslint devel: true, bitwise: true, closure: true, continue: true, eqeq: true, es5: true, forin: true
, plusplus: true, regexp: true, undef: true, sloppy: true, sub: true, stupid: true, vars: true, white: true */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'relay', function() {

    var globe = this || window;

    /**
     *
     * Integrate a module into a host. Null|undefined items are skipped. Effins bridge 1
     * level deep. Supplier items whose .relay property is `false` get skipped. If the
     * .relay is a function, it is called as supplierItem.relay($, receiverItem)
     * If the .relay result is null|undefined then supplierItem transfers as is. If
     * the .relay result is anything else other than `false`, the result transfers.
     *
     * @this   {Object|Function}        supplier
     * @param  {Object|Function} r      receiver
     * @param  {boolean=}        force  option to overwrite existing props (default: false)
     * @param  {*=}              $      host api function for relays, or `null` for none
     *                                  If undefined, defaults to the receiver
     */
    function bridge(r, force, $) {
        var k, custom, s = this; // supplier
        if (s === globe) {
            throw new Error('@this'); 
        }
        custom = s['bridge'];
        if (custom !== bridge && typeof custom == 'function' && custom['relay'] === false) {
            return custom.apply(s, arguments);
        }
        force = true === force;
        $ = void 0 === $ ? r : $;
        for (k in s) {
            if (null != s[k]) {
                if ('fn' === k && s[k] !== s) {
                    r[k] && bridge.call(s[k], r[k], force, $);
                } else if (force || null == r[k]) {
                    custom = s[k]['relay'];
                    custom = typeof custom == 'function' ? s[k]['relay']($, r[k]) : false !== custom && s[k];
                    false === custom || (r[k] = null == custom ? s[k] : custom);
                }
            }
        }
        return r;
    }
    
    // signify that the bridge is universal
    bridge['relay'] = true;

    return {
        'bridge': bridge

        /**
         * @this   {Object|Function} receiver
         * @param  {...}             suppliers
         */
      , 'submix': function(suppliers) {
            var i = 0, l = arguments.length;
            if (this === globe) {
                throw new Error('@this'); 
            }
            while (i < l) {
                bridge.call(arguments[i++], this, typeof arguments[i] != 'boolean' || arguments[i++]);
            }
            return this;
        }
    };
}));