// 图片加密工具
const ImageCrypto = {
    // 加密密钥 (请修改为你的随机密钥)
    key: 'your-random-key-12345',
    
    // 加密图片名称
    encryptName: function(index) {
        const name = `${index}.jpg`;
        return CryptoJS.AES.encrypt(name, this.key).toString();
    },
    
    // 解密图片名称
    decryptName: function(encrypted) {
        const bytes = CryptoJS.AES.decrypt(encrypted, this.key);
        return bytes.toString(CryptoJS.enc.Utf8);
    },
    
    // 生成加密的图片URL
    getImageUrl: function(index) {
        const timestamp = new Date().getTime();
        const data = `${index}-${timestamp}`;
        const hash = CryptoJS.HmacSHA256(data, this.key).toString();
        return `./images/${index}.jpg?hash=${hash}&t=${timestamp}`;
    },
    
    // 验证图片URL
    validateUrl: function(url) {
        const params = new URLSearchParams(url.split('?')[1]);
        const timestamp = params.get('t');
        const hash = params.get('hash');
        const index = url.split('/').pop().split('.')[0];
        
        const data = `${index}-${timestamp}`;
        const expectedHash = CryptoJS.HmacSHA256(data, this.key).toString();
        
        return hash === expectedHash;
    }
};
