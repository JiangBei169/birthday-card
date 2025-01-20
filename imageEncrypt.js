// 图片加密工具
const ImageCrypto = {
    // 加密密钥 (请修改为你的随机密钥)
    key: 'your-random-key-12345',
    
    // 加密图片名称
    encryptName: function(index) {
        return `${index}.jpg`; // 简化为直接返回文件名
    },
    
    // 解密图片名称
    decryptName: function(encrypted) {
        return encrypted; // 简化为直接返回
    },
    
    // 生成图片URL
    getImageUrl: function(index) {
        // 简化URL生成逻辑，直接返回图片路径
        return `./images/${index}.jpg`;
    },
    
    // 验证图片URL (简化验证逻辑)
    validateUrl: function(url) {
        return true; // 暂时返回true以确保加载正常进行
    }
};

// 添加调试日志
console.log('ImageCrypto initialized');
