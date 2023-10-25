export class Bitmap {

  private image: HTMLImageElement;
  
  constructor(src: string, private width: number, private height: number) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
  }
}

export class BlockSide {
  texture?: Bitmap;
  color?: string;
}

export class Block {
  sides: BlockSide[] = new Array(4);
  height: number;

  constructor(
    sides: BlockSide[],
    height = 1
  ) {
    this.sides = sides;
    this.height = height;
  }
}