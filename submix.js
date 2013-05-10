/*!
 * submix       module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/submix
 * @license     MIT
 * @version     0.6.1
 */

/*jshint expr:true, laxcomma:true, sub:true, supernew:true, debug:true, node:true, boss:true, evil:true, 
  undef:true, eqnull:true, unused:true, browser:true, devel:true, jquery:true, indent:4, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'submix', function() {

    var globe = this || window;

    /**
     * Integrate a module into a host. Null|undefined items are skipped. Effins bridge 1
     * level deep. Supplier items whose .bus property is `false` get skipped. If the
     * .bus is a function, it is called as supplierItem.bus($, receiverItem)
     * If the .bus result is null|undefined then supplierItem transfers as is. If
     * the .bus result is anything else other than `false`, the result transfers.
     *
     * @this   {Object|Function}            supplier
     * @param  {Object|Function}     r      receiver
     * @param  {(boolean|Function)=} send   bool: option to force overwrite (default: false)
     *                                      func: test or customize transferred values
     *                                      - defaults to the "send" prop of each supplier value
     *                                      - exact signature is still in development
     *                                      - overwrite is implicit unless stopped by `send`
     * @param  {*=}                  $      host wrapper function for sends, or `false` for none
     *                                      - if null|undefined then `$` defaults to `receiver`
     */
    function bridge(r, send, $) {
        var k, force, s = this, custom = s['bridge'];
        if (custom !== bridge && typeof custom == 'function' && custom['bus'] === false) {
            // Don't let globe supply to custom bridges. Return `r` regardless.
            return s === globe || custom.apply(s, arguments), r;
        }
        $ = null == $ ? r : $;
        (force = typeof send == 'function') || (force = true === send, send = null);
        for (k in s) {
            if (null != s[k]) {
                if ('fn' === k && s[k] !== s) {
                    r[k] && bridge.call(s[k], r[k], send, $);
                } else if (force ? $ !== r[k] : null == r[k]) {
                    custom = send || s[k]['bus'];
                    custom = typeof custom == 'function' ? custom.call(s[k], $, r[k]) : false !== custom && s[k];
                    false === custom || (r[k] = null == custom ? s[k] : custom);
                }
            }
        }
        return r;
    }

    // affirm that the bridge is universal (for detection as such)
    bridge['bus'] = true;

    /**
     * Like bridge, but with semi-inverted signature
     * @this   {Object|Function}            receiver
     * @param  {Object|Function}     s      supplier
     * @param  {(boolean|Function)=} send
     * @param  {*=}                  $
     */
    function submix(s, send, $) {
        return bridge.call(s, this === globe ? {} : this, send, $);
    }
    
    // tracks() differs from submix() in 2 ways:
    // - submix() accepts 1 supplier and does not overwrite by default.
    // - tracks() accepts multiple suppliers and forces overwrite by default.
    
    /**
     * @this  {Object|Function}
     * If multiple "tracks" are passed, the zeroith becomes the receiver and
     * the rest become suppliers. Otherwise `this` receives the supplier (in 
     * which case the receiver defers to a plain object if `this` is the globe.)
     * Other args (options) may be passed starting at the last boolean arg.
     */
    function tracks() {
        var ops, receiver, trax = [], x = trax.push.apply(trax, arguments), i = x, j = 0;
        // Extract the send/$ options if included. Else set `ops` to `true` to force overwrite.
        ops = typeof trax[--i] != 'boolean' && typeof trax[--i] != 'boolean' || trax.splice(x = i, 2);
        ops = [receiver = 1 < x ? trax[j++] : this === globe ? {} : this].concat(ops);
        while (j < x) bridge.apply(trax[j++], ops);
        return receiver;
    }

    submix['bridge'] = bridge;
    submix['tracks'] = tracks;
    submix['submix'] = submix;
    return submix;
}));