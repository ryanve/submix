/*!
 * submix       module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/submix
 * @license     MIT
 * @version     0.8.1
 */

/*jshint expr:true, sub:true, supernew:true, debug:true, node:true, boss:true, devel:true, evil:true, 
  laxcomma:true, eqnull:true, undef:true, unused:true, browser:true, jquery:true, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'submix', function() {

    var globe = this || window;

    /**
     * Integrate a module into a host. null|undefined items are skipped. Effins bridge
     * a level deep. Supplier items whose .aux property is `false` are skipped. If the
     * .aux is a function, it is used to determine or modify the transferred value:
     * - If the .aux result is null|undefined then supplier item transfers as it was.
     * - If the .aux result is anything else other than `false`, its result transfers.
     * Function `send` params fire on each item and take precedence over .aux.
     *
     * @this   {Object|Function|Array}      supplier(s)
     * @param  {Object|Function}       r    receiver
     * @param  {(boolean|Function|*)=} send bool: option to force overwrite (default: false)
     *                                      func: callback to test or customize transferred values:
     *                                      - takes precedence over .aux
     *                                      - overwrites unless its result is `false`
     *                                      - null|undefined results revert to their orig value
     *                                      - supplierItem.aux($, receiverItem) is the working signature
     *                                      - if 3qual to `bridge`, avoid custom bridges
     * @param  {*=}                    $    host (main wrapper function) for usage in aux/sends
     *                                      - if `$` 3quals `undefined`, default to `receiver`
     *                                      - if `$` 3quals `bridge`, ignore 'aux' methods
     */
    function bridge(r, send, $) {
        var v, k, s, b, aux, fwd, force = !!send, sources = [].concat(this), l = sources.length, i = 0;
        fwd = send !== bridge && !(aux = typeof send == 'function' && send);
        $ === bridge ? (aux = aux || 1) : ($ = void 0 === $ ? r : $);
        $ = typeof $ == 'function' && $;  // Ensure false|function
        while (i < l) {
            s = sources[i++];
            if (fwd && typeof(b = s['bridge']) == 'function' && b !== bridge && b['aux'] === false) {
                s === globe || b.apply(s, arguments); // Guard globe. Run conformant custom bridges.
            } else for (k in s) {
                if (null != (v = s[k])) {
                    if ('fn' === k && r[k] && v !== s) {
                        bridge.call(v, r[k], send, $);
                    } else if (force ? $ !== r[k] : null == r[k]) {
                        b = aux || v['aux'];
                        b = typeof b == 'function' ? b.call(v, $, r[k], v, k) : false !== b && null;
                        false !== b && (r[k] = null == b ? v : b);
                    }
                }
            }
        }
        return r;
    }

    // affirm that the bridge is universal (for detection as such)
    bridge['aux'] = true;

    /**
     * Like bridge, but with semi-inverted signature
     * @this   {Object|Function}             receiver
     * @param  {Object|Function|Array} s     supplier(s)
     * @param  {(boolean|Function)=}   send
     * @param  {*=}                    $
     */
    function submix(s, send, $) {
        return bridge.call(s, this === globe ? {} : this, send, $);
    }
    
    // tracks() differs from submix() in 2 ways:
    // - submix() accepts 1 supplier param and does not overwrite by default.
    // - tracks() accepts multiple supplier params and forces overwrite by default.
    
    /**
     * @this  {Object|Function}
     * If multiple "tracks" are passed, the zeroith becomes the receiver and
     * the rest become suppliers. Otherwise `this` receives the supplier (in 
     * which case the receiver defers to a plain object if `this` is the globe.)
     * Other args (options) may be passed starting at the last boolean arg.
     */
    function tracks() {
        var ops, receiver, trax = [], x = trax.push.apply(trax, arguments), i = x;
        // Extract the send/$ options if included. Else set `ops` to `true` to force overwrite.
        ops = typeof trax[i-=2] != 'boolean' && typeof trax[++i] != 'boolean' || trax.splice(x = i, 2);
        ops = [receiver = 1 < x ? trax.shift() : this === globe ? {} : this].concat(ops);
        return bridge.apply(trax, ops);
    }

    submix['bridge'] = bridge;
    submix['tracks'] = tracks;
    submix['submix'] = submix;
    return submix;
}));