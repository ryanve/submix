/*!
 * submix       module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/submix
 * @license     MIT
 * @version     0.3.0
 */

/*jshint expr:true, laxcomma:true, sub:true, supernew:true, debug:true, node:true, boss:true, evil:true, 
  undef:true, eqnull:true, unused:true, browser:true, devel:true, jquery:true, indent:4, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'submix', function() {

    var globe = this || window;

    /**
     * Integrate a module into a host. Null|undefined items are skipped. Effins bridge 1
     * level deep. Supplier items whose .send property is `false` get skipped. If the
     * .send is a function, it is called as supplierItem.send($, receiverItem)
     * If the .send result is null|undefined then supplierItem transfers as is. If
     * the .send result is anything else other than `false`, the result transfers.
     *
     * @this   {Object|Function}        supplier
     * @param  {Object|Function} r      receiver
     * @param  {boolean=}        force  option to overwrite existing props (default: false)
     * @param  {*=}              $      host api function for sends, or `null` for none
     *                                  If undefined, defaults to the receiver
     * @param  {Function=}       send   callback for testing or customizing transferred values
     *                                  - defaults to the "send" prop of each supplier value
     *                                  - exact signature is still in development
     */
    function bridge(r, force, $, send) {
        var k, custom, s = this; // supplier
        if (s === globe) {
            throw new Error('@this'); 
        }
        custom = s['bridge'];
        if (custom !== bridge && typeof custom == 'function' && custom['send'] === false) {
            return custom.apply(s, arguments);
        }
        force = true === force;
        $ = void 0 === $ ? r : $;
        for (k in s) {
            if (null != s[k]) {
                if ('fn' === k && s[k] !== s) {
                    r[k] && bridge.call(s[k], r[k], force, $);
                } else if (force ? $ !== r[k] : null == r[k]) {
                    custom = send || s[k]['send'];
                    custom = typeof custom == 'function' ? send.call(s[k], $, r[k]) : false !== custom && s[k];
                    false === custom || (r[k] = null == custom ? s[k] : custom);
                }
            }
        }
        return r;
    }

    // signify that the bridge is universal
    bridge['send'] = true;
    
    /**
     * @this   {Object|Function} receiver
     * @param  {...}             suppliers
     */
    function submix(suppliers) {
        var i = 0, l = arguments.length;
        if (this === globe) {
            throw new Error('@this'); 
        }
        while (i < l) {
            bridge.call(arguments[i++], this, typeof arguments[i] != 'boolean' || arguments[i++]);
        }
        return this;
    }
    
    submix['bridge'] = bridge;
    submix['submix'] = submix;
    return submix;
}));