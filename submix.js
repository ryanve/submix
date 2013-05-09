/*!
 * submix       module integration utility
 * @author      Ryan Van Etten
 * @link        http://github.com/ryanve/submix
 * @license     MIT
 * @version     0.4.0
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
     * @this   {Object|Function}            supplier
     * @param  {Object|Function}     r      receiver
     * @param  {(boolean|Function)=} send   bool: option to force overwrite (default: false)
     *                                      func: test or customize transferred values
     *                                      - defaults to the "send" prop of each supplier value
     *                                      - exact signature is still in development
     *                                      - overwrite is implicit unless stopped by `send`
     * @param  {*=}                  $      host wrapper function for sends, or `null` for none
     *                                      - if undefined (===) then `$` defaults to `receiver`
     */
    function bridge(r, send, $) {
        var k, custom, force, s = this;
        if (s === globe) { throw new Error('@this'); }
        custom = s['bridge'];
        if (custom !== bridge && typeof custom == 'function' && custom['send'] === false) {
            return custom.apply(s, arguments);
        }
        $ = void 0 === $ ? r : $;
        (force = typeof send == 'function') || (force = true === send, send = null);
        for (k in s) {
            if (null != s[k]) {
                if ('fn' === k && s[k] !== s) {
                    r[k] && bridge.call(s[k], r[k], send, $);
                } else if (force ? $ !== r[k] : null == r[k]) {
                    custom = send || s[k]['send'];
                    custom = typeof custom == 'function' ? custom.call(s[k], $, r[k]) : false !== custom && s[k];
                    false === custom || (r[k] = null == custom ? s[k] : custom);
                }
            }
        }
        return r;
    }

    // certify that the bridge is universal
    bridge['send'] = true;
    
    
    /**
     * Like bridge, but with semi-inverted signature
     * @this   {Object|Function}            receiver
     * @param  {Object|Function}     s      supplier
     * @param  {(boolean|Function)=} send
     * @param  {*=}                  $
     */
    function submix(s, send, $) {
        if (this === globe) { throw new Error('@this'); }
        return bridge.call(s, this, send, $);
    }
    
    /**
     * @this    {Object|Function} receiver
     */
    function tracks() {
        if (this === globe) { throw new Error('@this'); }
        var trax = [], l = trax.push.apply(trax, arguments), i = l, ops = 'boolean';
        ops = typeof trax[--i] == ops || typeof trax[--i] == ops ? trax.splice(i, l = i) : true;
        for (i = 0; i < l; ) {
            bridge.apply(trax[i++], [this].concat(ops));
        }
        return this;
    }
    
    submix['bridge'] = bridge;
    submix['tracks'] = tracks;
    submix['submix'] = submix;
    return submix;
}));