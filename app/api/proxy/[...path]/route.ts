// API Route para fazer proxy das requisições HTTP para evitar Mixed Content
// Esta rota permite que requisições HTTPS façam proxy para a API HTTP
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
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

    // Obter headers da requisição original
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Fazer requisição para a API
    const response = await fetch(fullUrl, fetchOptions);

    // Obter resposta
    const data = await response.json();

    // Retornar resposta com status e headers corretos
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
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
      { status: 500 }
    );
  }
}

