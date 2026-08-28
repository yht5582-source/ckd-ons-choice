(function (root) {
    function getProteinTarget(dialysis, pdProteinStatus) {
        if (dialysis === 'ndd') {
            return { min: 0.6, max: 0.8, label: '0.6~0.8g' };
        }

        if (dialysis === 'hd') {
            return { min: 1.2, max: 1.4, label: '1.2~1.4g' };
        }

        if (pdProteinStatus === 'catabolic') {
            return { min: 1.3, max: 1.5, label: '1.3~1.5g' };
        }

        if (pdProteinStatus === 'protein_loss') {
            return { min: 1.2, max: 1.3, label: '1.2~1.3g' };
        }

        return { min: 1.0, max: 1.2, label: '1.0~1.2g' };
    }

    root.getProteinTarget = getProteinTarget;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { getProteinTarget };
    }
})(typeof window !== 'undefined' ? window : globalThis);
