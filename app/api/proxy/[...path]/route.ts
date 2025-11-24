// API Route para fazer proxy das requisições HTTP para evitar Mixed Content e CORS
// Esta rota permite que requisições façam proxy para a API, evitando problemas de CORS
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234:8000';

// Headers CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Montar o path completo (os serviços já incluem /api/ no endpoint)
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/api/${path}`;
    
    // Obter query string se existir
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    // Verificar se é multipart/form-data (upload de arquivo)
    const requestContentType = request.headers.get('content-type') || '';
    const isMultipart = requestContentType.includes('multipart/form-data');

    // Obter headers da requisição original
    const headers: Record<string, string> = {};

    // Copiar Authorization header se existir
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Preparar opções da requisição
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Adicionar body para POST e PUT
    if (method === 'POST' || method === 'PUT') {
      if (isMultipart) {
        // Para multipart/form-data, reconstruir o FormData corretamente
        const incomingFormData = await request.formData();
        
        // Criar novo FormData para garantir compatibilidade
        const newFormData = new FormData();
        
        // Copiar todos os campos, especialmente os arquivos
        for (const [key, value] of incomingFormData.entries()) {
          // Verificar se é File
          if (value instanceof File) {
            // Para arquivos, criar um novo File a partir do Blob para garantir compatibilidade
            const arrayBuffer = await value.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: value.type });
            const newFile = new File([blob], value.name, { type: value.type });
            newFormData.append(key, newFile);
          } else {
            // Para strings e outros valores
            newFormData.append(key, value);
          }
        }
        
        fetchOptions.body = newFormData;
        // Não definir Content-Type - o fetch define automaticamente com boundary
      } else {
        // Para JSON, definir Content-Type e passar como texto
        headers['Content-Type'] = 'application/json';
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      }
    }

    // Fazer requisição para a API
    const response = await fetch(fullUrl, fetchOptions);

    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    let data: unknown;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Se falhar ao fazer parse, usar texto
        const text = await response.text();
        data = text ? { message: text } : { message: 'Resposta vazia' };
      }
    } else {
      // Se não for JSON, tentar ler como texto
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : { message: 'Resposta vazia' };
      } catch {
        data = { message: text || 'Erro na requisição' };
      }
    }

    // Retornar resposta com status e headers corretos (incluindo CORS)
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Erro no proxy:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro no proxy',
        data: null,
        errors: null,
      },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

