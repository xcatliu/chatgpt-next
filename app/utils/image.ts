export interface ImageProp {
  src: string;
  width: number;
  height: number;
}

/**
 * 图片按照这个方式缩放：
 * Image inputs are metered and charged in tokens, just as text inputs are.
 * The token cost of a given image is determined by two factors: its size, and the detail option on each image_url block.
 * All images with detail: low cost 85 tokens each.
 * detail: high images are first scaled to fit within a 2048 x 2048 square, maintaining their aspect ratio.
 * Then, they are scaled such that the shortest side of the image is 768px long.
 * Finally, we count how many 512px squares the image consists of.
 * Each of those squares costs 170 tokens. Another 85 tokens are always added to the final total.
 */
export function smallImageSize({ width, height }: { width: number; height: number }) {
  const isWidthLongerThanHeight = width > height;
  /** 长边 */
  let longerSide = isWidthLongerThanHeight ? width : height;
  /** 短边 */
  let shorterSide = isWidthLongerThanHeight ? height : width;
  /** 若长边大于 2048 */
  if (longerSide > 2048) {
    shorterSide = (shorterSide / longerSide) * 2048;
    longerSide = 2048;
  }
  /** 若短边大于 768 */
  if (shorterSide > 768) {
    longerSide = (longerSide / shorterSide) * 768;
    shorterSide = 768;
  }
  /** 取整数 */
  longerSide = Math.round(longerSide);
  shorterSide = Math.round(shorterSide);

  return {
    width: isWidthLongerThanHeight ? longerSide : shorterSide,
    height: isWidthLongerThanHeight ? shorterSide : longerSide,
  };
}

/**
 * 压缩图片为 openai 接受的尺寸
 */
export async function compressImage(imgSrc: string): Promise<ImageProp> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
      // 创建一个canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const originalSize = {
        width: img.width,
        height: img.height,
      };
      const size = smallImageSize(originalSize);

      // 如果不需要压缩尺寸
      if (originalSize.width === size.width && originalSize.height === size.height) {
        return resolve({
          src: imgSrc,
          ...size,
        });
      }

      // 设置canvas尺寸
      canvas.width = size.width;
      canvas.height = size.height;

      // 绘制图片到canvas
      ctx.drawImage(img, 0, 0, size.width, size.height);

      // 压缩图片的质量
      const quality = 0.8; // 压缩质量设置为0.8
      const compressedImage = canvas.toDataURL('image/jpeg', quality);

      resolve({
        src: compressedImage,
        ...size,
      });
    };
  });
}

/**
 * 读取上传的图片文件
 */
export async function readImageFile(file: File): Promise<ImageProp> {
  return new Promise((resolve) => {
    // 创建FileReader来读取此文件
    const reader = new FileReader();

    // 设置当读取操作完成时触发的回调函数
    reader.onload = async (readerEvent) => {
      // 获取文件内容 base64 编码
      const fileContent = readerEvent.target?.result as string;

      // 压缩图片大小为 openai 接受的大小
      const imageProp = await compressImage(fileContent);
      resolve(imageProp);
    };

    // 读取文件并转换为Base64编码
    reader.readAsDataURL(file);
  });
}
