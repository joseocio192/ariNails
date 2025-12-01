import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DisenosService } from './disenos.service';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { UpdateDisenoDto } from './dto/update-diseno.dto';
import { GetDisenosQueryDto } from './dto/diseno-list.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');

// Configuración de multer para subir imágenes
const storage = diskStorage({
  destination: './public/uploads/disenos',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    cb(new BadRequestException('Solo se permiten imágenes'), false);
  } else {
    cb(null, true);
  }
};

@ApiTags('Diseños de Uñas')
@Controller('disenos')
export class DisenosController {
  constructor(private readonly disenosService: DisenosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de diseños (admin/empleados)' })
  @ApiResponse({ status: 200, description: 'Lista de diseños obtenida exitosamente' })
  async findAll(@Query() query: GetDisenosQueryDto) {
    const data = await this.disenosService.findAll(query);
    return IResponse(data, 'Diseños obtenidos exitosamente', true);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener todos los diseños activos (público/clientes)' })
  @ApiResponse({ status: 200, description: 'Diseños activos obtenidos exitosamente' })
  async findAllActive() {
    const data = await this.disenosService.findAllActive();
    return IResponse(data, 'Diseños activos obtenidos exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un diseño por ID' })
  @ApiResponse({ status: 200, description: 'Diseño encontrado' })
  @ApiResponse({ status: 404, description: 'Diseño no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.disenosService.findOne(id);
    return IResponse(data, 'Diseño obtenido exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Crear un nuevo diseño' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Diseño Floral' },
        descripcion: { type: 'string', example: 'Diseño con flores' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Diseño creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o imagen no proporcionada' })
  async create(
    @Body() createDisenoDto: CreateDisenoDto,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    const empleadoId = req.user?.userId || req.user?.id;
    const data = await this.disenosService.create(createDisenoDto, file, empleadoId);
    return IResponse(data, 'Diseño creado exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen', { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Actualizar un diseño existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Diseño Actualizado' },
        descripcion: { type: 'string', example: 'Nueva descripción' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Diseño actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Diseño no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisenoDto: UpdateDisenoDto,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    const empleadoId = req.user?.userId || req.user?.id;
    const data = await this.disenosService.update(id, updateDisenoDto, file, empleadoId);
    return IResponse(data, 'Diseño actualizado exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un diseño' })
  @ApiResponse({ status: 200, description: 'Diseño eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Diseño no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.disenosService.remove(id);
    return IResponse(null, 'Diseño eliminado exitosamente', true);
  }
}
