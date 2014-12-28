var AbstractFilter = require('./AbstractFilter');

/**
 * A Smart Blur Filter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function SmartBlurFilter() {
    AbstractFilter.call(this);

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',

        'uniform sampler2D uSampler;',
        'const vec2 delta = vec2(1.0/10.0, 0.0);',

        'float random(vec3 scale, float seed) {',
        '   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
        '}',


        'void main(void) {',
        '   vec4 color = vec4(0.0);',
        '   float total = 0.0;',

        '   float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);',

        '   for (float t = -30.0; t <= 30.0; t++) {',
        '       float percent = (t + offset - 0.5) / 30.0;',
        '       float weight = 1.0 - abs(percent);',
        '       vec4 sample = texture2D(uSampler, vTextureCoord + delta * percent);',
        '       sample.rgb *= sample.a;',
        '       color += sample * weight;',
        '       total += weight;',
        '   }',

        '   gl_FragColor = color / total;',
        '   gl_FragColor.rgb /= gl_FragColor.a + 0.00001;',
        '}'
    ];
}

SmartBlurFilter.prototype = Object.create(AbstractFilter.prototype);
SmartBlurFilter.prototype.constructor = SmartBlurFilter;
module.exports = SmartBlurFilter;
