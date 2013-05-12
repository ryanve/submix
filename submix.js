/*!
 * submix       module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/submix
 * @license     MIT
 * @version     0.7.3
 */

/*jshint expr:true, laxcomma:true, sub:true, supernew:true, debug:true, node:true, boss:true, evil:true, 
  undef:true, eqnull:true, unused:true, browser:true, devel:true, jquery:true, indent:4, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'submix', function() {

    var globe = this || window;

    /**
     * Integrate a module into a host. null|undefined items are skipped. Effins bridge
     * a level deep. Supplier items whose .bus property is `false` are skipped. If the
     * .bus is a function, it is used to determine or modify the transferred value:
     * - If the .bus result is null|undefined then supplier item transfers as it was.
     * - If the .bus result is anything else other than `false`, its result transfers.
     * Function `send` params fire on each item and take precedence over .bus.
     *
     * @this   {Object|Function}            supplier (source)
     * @param  {Object|Function}       r    receiver (target)
     * @param  {(boolean|Function|*)=} send bool: option to force overwrite (default: false)
     *                                      func: callback to test or customize transferred values:
     *                                      - takes precedence over .bus
     *                                      - overwrites unless its result is `false`
     *                                      - null|undefined results revert to their orig value
     *                                      - supplierItem.bus($, receiverItem) is the working signature
     *                                      - if 3qual to `bridge`, avoid custom bridges
     * @param  {*=}                    $    host (main wrapper function) for usage in sends/buses
     *                                      - if `$` is `undefined`, default to `receiver`
     *                                      - if `$` 3quals `bridge`, ignore 'bus' methods
     */
    function bridge(r, send, $) {
        var v, k, b, aux, force = !!send, s = this;
        send !== bridge && (aux = typeof send == 'function' && send);
        if (false === aux && typeof(b = s['bridge']) == 'function' && b !== bridge && b['bus'] === false) {
            s === globe || b.apply(s, arguments); // Guard globe. Run conformant custom bridges.
        } else {
            $ === bridge ? (aux = aux || 1) : ($ = void 0 === $ ? r : $);
            $ = typeof $ == 'function' && $;  // Ensure false|function
            for (k in s) {
                if (null != (v = s[k])) {
                    if ('fn' === k && r[k] && v !== s) {
                        bridge.call(v, r[k], send, $);
                    } else if (force ? $ !== r[k] : null == r[k]) {
                        b = aux || v['bus'];
                        b = typeof b == 'function' ? b.call(v, $, r[k]) : false !== b && null;
                        false !== b && (r[k] = null == b ? v : b);
                    }
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
        ops = typeof trax[i-=2] != 'boolean' && typeof trax[++i] != 'boolean' || trax.splice(x = i, 2);
        ops = [receiver = 1 < x ? trax[j++] : this === globe ? {} : this].concat(ops);
        for (; j < x; j++) { 
            null == trax[j] || bridge.apply(trax[j], ops);
        }
        return receiver;
    }

    submix['bridge'] = bridge;
    submix['tracks'] = tracks;
    submix['submix'] = submix;
    return submix;
}));