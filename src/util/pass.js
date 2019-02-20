export default function setPass(e) {
    function t(e, t) {
        return e << t | e >>> 32 - t
    }
    function n(e, t) {
        var n, r, o, i, a;
        return o = 2147483648 & e,
        i = 2147483648 & t,
        a = (1073741823 & e) + (1073741823 & t),
        (n = 1073741824 & e) & (r = 1073741824 & t) ? 2147483648 ^ a ^ o ^ i : n | r ? 1073741824 & a ? 3221225472 ^ a ^ o ^ i : 1073741824 ^ a ^ o ^ i : a ^ o ^ i
    }
    function r(e, r, o, i, a, s, c) {
        return e = n(e, n(n(function(e, t, n) {
            return e & t | ~e & n
        }(r, o, i), a), c)),
        n(t(e, s), r)
    }
    function o(e, r, o, i, a, s, c) {
        return e = n(e, n(n(function(e, t, n) {
            return e & n | t & ~n
        }(r, o, i), a), c)),
        n(t(e, s), r)
    }
    function i(e, r, o, i, a, s, c) {
        return e = n(e, n(n(function(e, t, n) {
            return e ^ t ^ n
        }(r, o, i), a), c)),
        n(t(e, s), r)
    }
    function a(e, r, o, i, a, s, c) {
        return e = n(e, n(n(function(e, t, n) {
            return t ^ (e | ~n)
        }(r, o, i), a), c)),
        n(t(e, s), r)
    }
    function s(e) {
        var t, n = "", r = "";
        for (t = 0; 3 >= t; t++)
            n += (r = "0" + (e >>> 8 * t & 255).toString(16)).substr(r.length - 2, 2);
        return n
    }
    var c, u, l, f, p, d, h, m, v, b;
    for (b = function(e) {
        for (var t, n = e.length, r = n + 8, o = 16 * ((r - r % 64) / 64 + 1), i = new Array(o - 1), a = 0, s = 0; n > s; )
            a = s % 4 * 8,
            i[t = (s - s % 4) / 4] = i[t] | e.charCodeAt(s) << a,
            s++;
        return a = s % 4 * 8,
        i[t = (s - s % 4) / 4] = i[t] | 128 << a,
        i[o - 2] = n << 3,
        i[o - 1] = n >>> 29,
        i
    }(e = function(e) {
        e = e.replace(/\r\n/g, "\n");
        for (var t = "", n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            128 > r ? t += String.fromCharCode(r) : r > 127 && 2048 > r ? (t += String.fromCharCode(r >> 6 | 192),
            t += String.fromCharCode(63 & r | 128)) : (t += String.fromCharCode(r >> 12 | 224),
            t += String.fromCharCode(r >> 6 & 63 | 128),
            t += String.fromCharCode(63 & r | 128))
        }
        return t
    }(e)),
    d = 1732584193,
    h = 4023233417,
    m = 2562383102,
    v = 271733878,
    c = 0; c < b.length; c += 16)
        u = d,
        l = h,
        f = m,
        p = v,
        d = r(d, h, m, v, b[c + 0], 7, 3614090360),
        v = r(v, d, h, m, b[c + 1], 12, 3905402710),
        m = r(m, v, d, h, b[c + 2], 17, 606105819),
        h = r(h, m, v, d, b[c + 3], 22, 3250441966),
        d = r(d, h, m, v, b[c + 4], 7, 4118548399),
        v = r(v, d, h, m, b[c + 5], 12, 1200080426),
        m = r(m, v, d, h, b[c + 6], 17, 2821735955),
        h = r(h, m, v, d, b[c + 7], 22, 4249261313),
        d = r(d, h, m, v, b[c + 8], 7, 1770035416),
        v = r(v, d, h, m, b[c + 9], 12, 2336552879),
        m = r(m, v, d, h, b[c + 10], 17, 4294925233),
        h = r(h, m, v, d, b[c + 11], 22, 2304563134),
        d = r(d, h, m, v, b[c + 12], 7, 1804603682),
        v = r(v, d, h, m, b[c + 13], 12, 4254626195),
        m = r(m, v, d, h, b[c + 14], 17, 2792965006),
        d = o(d, h = r(h, m, v, d, b[c + 15], 22, 1236535329), m, v, b[c + 1], 5, 4129170786),
        v = o(v, d, h, m, b[c + 6], 9, 3225465664),
        m = o(m, v, d, h, b[c + 11], 14, 643717713),
        h = o(h, m, v, d, b[c + 0], 20, 3921069994),
        d = o(d, h, m, v, b[c + 5], 5, 3593408605),
        v = o(v, d, h, m, b[c + 10], 9, 38016083),
        m = o(m, v, d, h, b[c + 15], 14, 3634488961),
        h = o(h, m, v, d, b[c + 4], 20, 3889429448),
        d = o(d, h, m, v, b[c + 9], 5, 568446438),
        v = o(v, d, h, m, b[c + 14], 9, 3275163606),
        m = o(m, v, d, h, b[c + 3], 14, 4107603335),
        h = o(h, m, v, d, b[c + 8], 20, 1163531501),
        d = o(d, h, m, v, b[c + 13], 5, 2850285829),
        v = o(v, d, h, m, b[c + 2], 9, 4243563512),
        m = o(m, v, d, h, b[c + 7], 14, 1735328473),
        d = i(d, h = o(h, m, v, d, b[c + 12], 20, 2368359562), m, v, b[c + 5], 4, 4294588738),
        v = i(v, d, h, m, b[c + 8], 11, 2272392833),
        m = i(m, v, d, h, b[c + 11], 16, 1839030562),
        h = i(h, m, v, d, b[c + 14], 23, 4259657740),
        d = i(d, h, m, v, b[c + 1], 4, 2763975236),
        v = i(v, d, h, m, b[c + 4], 11, 1272893353),
        m = i(m, v, d, h, b[c + 7], 16, 4139469664),
        h = i(h, m, v, d, b[c + 10], 23, 3200236656),
        d = i(d, h, m, v, b[c + 13], 4, 681279174),
        v = i(v, d, h, m, b[c + 0], 11, 3936430074),
        m = i(m, v, d, h, b[c + 3], 16, 3572445317),
        h = i(h, m, v, d, b[c + 6], 23, 76029189),
        d = i(d, h, m, v, b[c + 9], 4, 3654602809),
        v = i(v, d, h, m, b[c + 12], 11, 3873151461),
        m = i(m, v, d, h, b[c + 15], 16, 530742520),
        d = a(d, h = i(h, m, v, d, b[c + 2], 23, 3299628645), m, v, b[c + 0], 6, 4096336452),
        v = a(v, d, h, m, b[c + 7], 10, 1126891415),
        m = a(m, v, d, h, b[c + 14], 15, 2878612391),
        h = a(h, m, v, d, b[c + 5], 21, 4237533241),
        d = a(d, h, m, v, b[c + 12], 6, 1700485571),
        v = a(v, d, h, m, b[c + 3], 10, 2399980690),
        m = a(m, v, d, h, b[c + 10], 15, 4293915773),
        h = a(h, m, v, d, b[c + 1], 21, 2240044497),
        d = a(d, h, m, v, b[c + 8], 6, 1873313359),
        v = a(v, d, h, m, b[c + 15], 10, 4264355552),
        m = a(m, v, d, h, b[c + 6], 15, 2734768916),
        h = a(h, m, v, d, b[c + 13], 21, 1309151649),
        d = a(d, h, m, v, b[c + 4], 6, 4149444226),
        v = a(v, d, h, m, b[c + 11], 10, 3174756917),
        m = a(m, v, d, h, b[c + 2], 15, 718787259),
        h = a(h, m, v, d, b[c + 9], 21, 3951481745),
        d = n(d, u),
        h = n(h, l),
        m = n(m, f),
        v = n(v, p);
    return (s(d) + s(h) + s(m) + s(v)).toLowerCase()
}