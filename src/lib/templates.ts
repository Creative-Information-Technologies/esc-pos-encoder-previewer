export interface Template {
  name: string;
  description: string;
  code: string;
}

export const templates: Template[] = [
  {
    name: 'Card',
    description: 'Tarjeta simple con borde y padding',
    code: `.Padding(20)
.Background("#FFFFFF")
.Border(1)
.BorderColor("#E5E7EB")
.CornerRadius(8)
.Column()
    .Spacing(10)
    .Padding(16)
    .Text("Titulo de la Tarjeta")
        .FontSize(18)
        .Bold()
        .FontColor("#1F2937")
    .Text("Este es el contenido de la tarjeta con estilos aplicados usando QuestPDF Fluent API.")
        .FontSize(12)
        .FontColor("#6B7280")
    .LineHorizontal(1)
        .BorderColor("#E5E7EB")
    .Row()
        .Spacing(8)
        .Text("Detalle 1")
            .FontSize(11)
            .FontColor("#9CA3AF")
        .Text("Detalle 2")
            .FontSize(11)
            .FontColor("#9CA3AF")`,
  },
  {
    name: 'Header',
    description: 'Encabezado de documento empresarial',
    code: `.Background("#1E3A5F")
.Padding(20)
.Row()
    .Spacing(16)
    .Column()
        .Text("EMPRESA S.A. de C.V.")
            .FontSize(22)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("RTN: 0801-1990-12345")
            .FontSize(11)
            .FontColor("#A7D4EF")
        .Text("Col. Centro, Calle Principal #123")
            .FontSize(10)
            .FontColor("#A7D4EF")
    .Column()
        .AlignRight()
        .Text("FACTURA")
            .FontSize(28)
            .Bold()
            .FontColor("#A7D4EF")
        .Text("No. 001-001-01-00000001")
            .FontSize(12)
            .FontColor("#FFFFFF")
        .Text("Fecha: 27/02/2026")
            .FontSize(10)
            .FontColor("#A7D4EF")`,
  },
  {
    name: 'Table',
    description: 'Tabla con encabezado y filas de datos',
    code: `.Padding(16)
.Background("#FFFFFF")
.Column()
    .Spacing(0)
    .Text("Detalle de Productos")
        .FontSize(16)
        .Bold()
        .FontColor("#1F2937")
        .Padding(8)
    .Row()
        .Background("#1E3A5F")
        .Padding(10)
        .Text("Producto")
            .FontSize(12)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Cantidad")
            .FontSize(12)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Precio")
            .FontSize(12)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Total")
            .FontSize(12)
            .Bold()
            .FontColor("#FFFFFF")
    .Row()
        .Padding(10)
        .Background("#F9FAFB")
        .Border(1)
        .BorderColor("#E5E7EB")
        .Text("Hamburguesa Classic")
            .FontSize(11)
            .FontColor("#374151")
        .Text("1")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 120.00")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 120.00")
            .FontSize(11)
            .FontColor("#374151")
    .Row()
        .Padding(10)
        .Background("#FFFFFF")
        .Border(1)
        .BorderColor("#E5E7EB")
        .Text("Coca-Cola 500ml")
            .FontSize(11)
            .FontColor("#374151")
        .Text("2")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 35.00")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 70.00")
            .FontSize(11)
            .FontColor("#374151")
    .Row()
        .Padding(10)
        .Background("#F9FAFB")
        .Border(1)
        .BorderColor("#E5E7EB")
        .Text("Papas Fritas")
            .FontSize(11)
            .FontColor("#374151")
        .Text("1")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 55.00")
            .FontSize(11)
            .FontColor("#374151")
        .Text("L. 55.00")
            .FontSize(11)
            .FontColor("#374151")
    .Row()
        .Padding(10)
        .Background("#1E3A5F")
        .Text("")
            .FontSize(11)
        .Text("")
            .FontSize(11)
        .Text("TOTAL:")
            .FontSize(13)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("L. 245.00")
            .FontSize(13)
            .Bold()
            .FontColor("#FFFFFF")`,
  },
  {
    name: 'Invoice',
    description: 'Factura completa con header, tabla y footer',
    code: `.Background("#FFFFFF")
.Padding(0)
.Column()
    .Spacing(0)

    .Row()
        .Background("#1E3A5F")
        .Padding(24)
        .Spacing(16)
        .Column()
            .Text("EMPRESA S.A. de C.V.")
                .FontSize(20)
                .Bold()
                .FontColor("#FFFFFF")
            .Text("RTN: 0801-1990-12345")
                .FontSize(10)
                .FontColor("#A7D4EF")
            .Text("CAI: ABC123-DEF456-GHI789")
                .FontSize(10)
                .FontColor("#A7D4EF")
        .Column()
            .AlignRight()
            .Text("FACTURA")
                .FontSize(26)
                .Bold()
                .FontColor("#A7D4EF")
            .Text("No. 001-001-01-00000001")
                .FontSize(12)
                .FontColor("#FFFFFF")

    .Row()
        .Padding(20)
        .Background("#F0F7FF")
        .Spacing(16)
        .Column()
            .Text("Facturado a:")
                .FontSize(10)
                .FontColor("#6B7280")
            .Text("Juan Perez")
                .FontSize(14)
                .Bold()
                .FontColor("#1F2937")
            .Text("RTN: 0801-1985-00001")
                .FontSize(10)
                .FontColor("#6B7280")
        .Column()
            .AlignRight()
            .Text("Fecha: 27/02/2026")
                .FontSize(11)
                .FontColor("#374151")
            .Text("Vendedor: Cajero 1")
                .FontSize(11)
                .FontColor("#374151")

    .Padding(20)
    .Row()
        .Background("#1E3A5F")
        .Padding(10)
        .Text("Descripcion")
            .FontSize(11)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Cant")
            .FontSize(11)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Precio")
            .FontSize(11)
            .Bold()
            .FontColor("#FFFFFF")
        .Text("Total")
            .FontSize(11)
            .Bold()
            .FontColor("#FFFFFF")

    .Row()
        .Padding(10)
        .Border(1)
        .BorderColor("#E5E7EB")
        .Text("Hamburguesa Classic")
            .FontSize(11)
            .FontColor("#374151")
        .Text("1")
            .FontSize(11)
        .Text("L. 120.00")
            .FontSize(11)
        .Text("L. 120.00")
            .FontSize(11)

    .Row()
        .Padding(10)
        .Background("#F9FAFB")
        .Border(1)
        .BorderColor("#E5E7EB")
        .Text("Coca-Cola 500ml")
            .FontSize(11)
        .Text("2")
            .FontSize(11)
        .Text("L. 35.00")
            .FontSize(11)
        .Text("L. 70.00")
            .FontSize(11)

    .Row()
        .Padding(16)
        .Background("#F0F7FF")
        .Text("")
        .Text("")
        .Text("TOTAL:")
            .FontSize(14)
            .Bold()
            .FontColor("#1E3A5F")
        .Text("L. 245.00")
            .FontSize(14)
            .Bold()
            .FontColor("#1E3A5F")

    .Padding(16)
    .Column()
        .Spacing(4)
        .Background("#F9FAFB")
        .Padding(16)
        .CornerRadius(4)
        .Text("SON: Doscientos cuarenta y cinco con 00/100 Lempiras")
            .FontSize(10)
            .FontColor("#6B7280")
        .Text("Fecha Limite Emision: 31/12/2026")
            .FontSize(10)
            .FontColor("#6B7280")
        .Text("Rango Autorizado: 001-001-01-00000001 a 001-001-01-00050000")
            .FontSize(10)
            .FontColor("#6B7280")

    .Padding(16)
    .AlignCenter()
    .Column()
        .Spacing(4)
        .Text("Gracias por su preferencia")
            .FontSize(12)
            .Bold()
            .FontColor("#1E3A5F")
            .AlignCenter()
        .Text("La factura es beneficio de todos, EXIJALA")
            .FontSize(10)
            .FontColor("#6B7280")
            .AlignCenter()`,
  },
  {
    name: 'Header Reporte',
    description: 'Encabezado de reporte con logo, título y chips informativos (QuestPDF real)',
    code: `using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net;

void HeaderStyle(IContainer container)
{
    var logoUrl = "https://tudominio.com/images/yalocobro.png";
    
    byte[] logoBytes;
    using (var client = new WebClient())
        logoBytes = client.DownloadData(logoUrl);

    container
        .Padding(10)
        .Background(Colors.Hex("#E6EEF5"))
        .Border(1)
        .BorderColor(Colors.Hex("#A7C7E7"))
        .CornerRadius(12)
        .Column(column =>
        {
            // Fila superior
            column.Item().Row(row =>
            {
                row.ConstantItem(160)
                    .Height(40)
                    .Image(logoBytes);

                row.RelativeItem()
                    .AlignCenter()
                    .AlignMiddle()
                    .Text("Inventario: Ingresos Por Productos")
                    .FontSize(18)
                    .Bold()
                    .FontColor(Colors.Hex("#1E3A5F"));

                row.ConstantItem(200)
                    .AlignRight()
                    .AlignMiddle()
                    .Text("Generado: 26/02/2026 7:33 pm")
                    .FontSize(10)
                    .FontColor(Colors.Hex("#334155"));
            });

            column.Item().PaddingTop(10);

            // Chips informativos
            column.Item().Row(row =>
            {
                row.RelativeItem().Element(ChipStyle)
                    .Text("Del 2026-02-26 00:00 al 2026-02-26 23:59")
                    .FontSize(10);

                row.RelativeItem().PaddingLeft(10).Element(ChipStyle)
                    .Text("Generado por: Erick Alvarado")
                    .FontSize(10);

                row.RelativeItem().PaddingLeft(10).Element(ChipStyle)
                    .Text("Nombre Organización: COMPANY EA")
                    .FontSize(10);
            });
        });
}`,
  },
];
