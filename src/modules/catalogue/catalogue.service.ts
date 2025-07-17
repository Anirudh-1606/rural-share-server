import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalogue, CatalogueDocument } from './catalogue.schema';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Injectable()
export class CatalogueService {
  constructor(
    @InjectModel(Catalogue.name) private catalogueModel: Model<CatalogueDocument>,
  ) {}

  async create(dto: CreateCatalogueDto): Promise<Catalogue> {
    // Verify parent exists if provided
    if (dto.parentId) {
      const parent = await this.catalogueModel.findById(dto.parentId);
      if (!parent) throw new BadRequestException('Parent category not found');
    }
    
    const catalogue = new this.catalogueModel(dto);
    return catalogue.save();
  }

  async findAll(type?: string): Promise<Catalogue[]> {
    const filter: any = { isActive: true };
    if (type) filter.type = type;
    
    return this.catalogueModel
      .find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findCategories(type?: string): Promise<Catalogue[]> {
    const filter: any = { parentId: null, isActive: true };
    if (type) filter.type = type;
    
    return this.catalogueModel
      .find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findSubcategories(parentId: string): Promise<Catalogue[]> {
    return this.catalogueModel
      .find({ parentId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Catalogue> {
    const catalogue = await this.catalogueModel.findById(id).exec();
    if (!catalogue) throw new NotFoundException('Catalogue item not found');
    return catalogue;
  }

  async update(id: string, dto: UpdateCatalogueDto): Promise<Catalogue> {
    // Verify parent exists if changing parent
    if (dto.parentId) {
      const parent = await this.catalogueModel.findById(dto.parentId);
      if (!parent) throw new BadRequestException('Parent category not found');
      
      // Prevent circular reference
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }
    
    const updated = await this.catalogueModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Catalogue item not found');
    return updated;
  }

  async delete(id: string): Promise<Catalogue> {
    // Check if has subcategories
    const hasSubcategories = await this.catalogueModel.countDocuments({ parentId: id });
    if (hasSubcategories > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }
    
    const removed = await this.catalogueModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Catalogue item not found');
    return removed;
  }

  async getHierarchy(): Promise<any[]> {
    const categories = await this.catalogueModel
      .find({ parentId: null, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    // For each category, get its subcategories
    for (const category of categories) {
      category['subcategories'] = await this.catalogueModel
        .find({ parentId: category._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean()
        .exec();
    }

    return categories;
  }
}
