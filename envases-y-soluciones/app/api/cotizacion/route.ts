import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  variantCode: string;
  capacity: number;
  height: number;
  diameter: number;
  price: number;
  discountPrice?: number;
  quantity: number;
  lidColors?: string[];
  selectedLidColor?: string;
}

interface ClienteData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  preferenciaContacto: "whatsapp" | "correo";
}

interface CotizacionRequest {
  cliente: ClienteData;
  productos: CartItem[];
}

async function generatePDF(cliente: ClienteData, productos: CartItem[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.29, 0.4, 0.25); // #4a6741
  const textColor = rgb(0.2, 0.2, 0.2);
  const grayColor = rgb(0.5, 0.5, 0.5);

  let yPosition = height - 50;

  // Header
  page.drawText("ENVASES & SOLUCIONES", {
    x: 50,
    y: yPosition,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 30;
  page.drawText("Solicitud de Cotización", {
    x: 50,
    y: yPosition,
    size: 18,
    font: font,
    color: textColor,
  });

  // Date
  const date = new Date().toLocaleDateString("es-CR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  page.drawText(`Fecha: ${date}`, {
    x: 400,
    y: height - 50,
    size: 10,
    font: font,
    color: grayColor,
  });

  // Line separator
  yPosition -= 20;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Client Information
  yPosition -= 30;
  page.drawText("Información del Cliente", {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 25;
  const clientInfo = [
    `Nombre: ${cliente.nombre} ${cliente.apellidos}`,
    `Correo: ${cliente.email}`,
    `Teléfono: ${cliente.telefono}`,
    `Preferencia de contacto: ${cliente.preferenciaContacto === "whatsapp" ? "WhatsApp" : "Correo electrónico"}`,
  ];

  for (const info of clientInfo) {
    page.drawText(info, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: textColor,
    });
    yPosition -= 18;
  }

  // Products Section
  yPosition -= 20;
  page.drawText("Productos Solicitados", {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });

  // Table Header
  yPosition -= 25;
  const tableHeaders = ["Producto", "Código", "Cant.", "Precio Unit.", "Subtotal"];
  const columnWidths = [150, 80, 50, 80, 80];
  let xPosition = 50;

  // Draw header background
  page.drawRectangle({
    x: 45,
    y: yPosition - 5,
    width: 505,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
  });

  for (let i = 0; i < tableHeaders.length; i++) {
    page.drawText(tableHeaders[i], {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: textColor,
    });
    xPosition += columnWidths[i];
  }

  // Table Rows
  yPosition -= 25;

  let totalPrice = 0;

  for (const producto of productos) {
    if (yPosition < 100) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      yPosition = newPage.getSize().height - 50;
    }

    const unitPrice = producto.discountPrice || producto.price;
    const subtotal = unitPrice * producto.quantity;
    totalPrice += subtotal;

    xPosition = 50;

    // Product name (truncate if too long)
    const productName = producto.productName.length > 25
      ? producto.productName.substring(0, 22) + "..."
      : producto.productName;

    page.drawText(productName, {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });

    // Add lid color if selected
    if (producto.selectedLidColor) {
      page.drawText(`Tapa: ${producto.selectedLidColor}`, {
        x: xPosition,
        y: yPosition - 12,
        size: 8,
        font: font,
        color: grayColor,
      });
    }
    xPosition += columnWidths[0];

    page.drawText(producto.variantCode, {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });
    xPosition += columnWidths[1];

    page.drawText(producto.quantity.toString(), {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });
    xPosition += columnWidths[2];

    page.drawText(`CRC ${unitPrice.toLocaleString()}`, {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });
    xPosition += columnWidths[3];

    page.drawText(`CRC ${subtotal.toLocaleString()}`, {
      x: xPosition,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: primaryColor,
    });

    // Draw line separator
    yPosition -= producto.selectedLidColor ? 15 : 5;
    page.drawLine({
      start: { x: 45, y: yPosition },
      end: { x: 550, y: yPosition },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });

    yPosition -= 20;
  }

  // Total Row
  yPosition -= 10;
  page.drawRectangle({
    x: 45,
    y: yPosition - 5,
    width: 505,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("TOTAL ESTIMADO:", {
    x: 330,
    y: yPosition + 3,
    size: 12,
    font: fontBold,
    color: textColor,
  });

  page.drawText(`CRC ${totalPrice.toLocaleString()}`, {
    x: 450,
    y: yPosition + 3,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  // Footer
  yPosition = 50;
  page.drawLine({
    start: { x: 50, y: yPosition + 20 },
    end: { x: 545, y: yPosition + 20 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText("Este documento es una solicitud de cotización, no una factura.", {
    x: 50,
    y: yPosition,
    size: 9,
    font: font,
    color: grayColor,
  });

  page.drawText("Envases y Soluciones - www.envasesoluciones.com", {
    x: 50,
    y: yPosition - 15,
    size: 9,
    font: font,
    color: grayColor,
  });

  return await pdfDoc.save();
}

export async function POST(request: NextRequest) {
  try {
    const body: CotizacionRequest = await request.json();
    const { cliente, productos } = body;

    // Validate request
    if (!cliente || !productos || productos.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = await generatePDF(cliente, productos);

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build products list for email
    const totalPrice = productos.reduce((sum, p) => {
      const price = p.discountPrice || p.price;
      return sum + (price * p.quantity);
    }, 0);

    const productsList = productos
      .map(
        (p) => {
          const unitPrice = p.discountPrice || p.price;
          const subtotal = unitPrice * p.quantity;
          return `• ${p.productName} (${p.variantCode}) - Cantidad: ${p.quantity} - Precio: ₡${subtotal.toLocaleString()}${p.selectedLidColor ? ` - Color de tapa: ${p.selectedLidColor}` : ""}`;
        }
      )
      .join("\n");

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "barbambu123@gmail.com",
      subject: `Nueva Cotización - ${cliente.nombre} ${cliente.apellidos}`,
      text: `
Nueva solicitud de cotización

INFORMACIÓN DEL CLIENTE
-----------------------
Nombre: ${cliente.nombre} ${cliente.apellidos}
Correo: ${cliente.email}
Teléfono: ${cliente.telefono}
Preferencia de contacto: ${cliente.preferenciaContacto === "whatsapp" ? "WhatsApp" : "Correo electrónico"}

PRODUCTOS SOLICITADOS
--------------------
${productsList}

TOTAL ESTIMADO: ₡${totalPrice.toLocaleString()}

Adjunto encontrará el PDF con el detalle de la cotización.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6741;">Nueva Solicitud de Cotización</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellidos}</p>
            <p><strong>Correo:</strong> ${cliente.email}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Preferencia de contacto:</strong> ${cliente.preferenciaContacto === "whatsapp" ? "WhatsApp" : "Correo electrónico"
        }</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Productos Solicitados</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #4a6741; color: white;">
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: left;">Código</th>
                  <th style="padding: 10px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productos
          .map(
            (p) => {
              const unitPrice = p.discountPrice || p.price;
              const subtotal = unitPrice * p.quantity;
              return `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">
                      ${p.productName}
                      ${p.selectedLidColor ? `<br><span style="font-size: 12px; color: #666;">Tapa: ${p.selectedLidColor}</span>` : ""}
                    </td>
                    <td style="padding: 10px;">${p.variantCode}</td>
                    <td style="padding: 10px; text-align: center;">${p.quantity}</td>
                    <td style="padding: 10px; text-align: right;">₡${unitPrice.toLocaleString()}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #4a6741;">₡${subtotal.toLocaleString()}</td>
                  </tr>
                `;
            }
          )
          .join("")}
                <tr style="background-color: #e8f5e9;">
                  <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">TOTAL ESTIMADO:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: #4a6741; font-size: 16px;">₡${totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Adjunto encontrará el PDF con el detalle completo de la cotización.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `cotizacion-${cliente.nombre.toLowerCase()}-${Date.now()}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing cotizacion:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}
