from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def create_pdf(filename, title, clauses):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph(title, styles['Title']))
    story.append(Spacer(1, 0.4 * inch))
    for heading, text in clauses:
        story.append(Paragraph(heading, styles['Heading3']))
        story.append(Paragraph(text, styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
    doc.build(story)
    print(f"Generated: {filename}")

def generate_spectrum():
    # 1. TOXIC
    create_pdf("data/level_1_toxic.pdf", "MSA: HOSTILE TERMS", [
        ("LIABILITY", "Service Provider shall be liable for all losses of any nature without limit, including indirect, consequential and speculative damages."),
        ("INTELLECTUAL PROPERTY", "All IP ever created by Service Provider is hereby assigned to Client in perpetuity."),
        ("PAYMENT", "Payment shall be made at Client's absolute discretion within 180 days of invoice."),
        ("TERMINATION", "Client may terminate this agreement at any time without notice and without any further payment obligation.")
    ])

    # 2. STANDARD
    create_pdf("data/level_2_standard.pdf", "MSA: COMMERCIAL STANDARD", [
        ("LIABILITY", "Each party's liability to the other shall be capped at the total fees paid under this agreement."),
        ("INTELLECTUAL PROPERTY", "IP created specifically for the deliverables under this agreement shall belong to the Client upon full payment."),
        ("PAYMENT", "Invoices shall be payable within 30 days of receipt."),
        ("TERMINATION", "Either party may terminate this agreement with 30 days written notice.")
    ])

    # 3. GOLD
    create_pdf("data/level_3_gold.pdf", "MSA: PROTECTIVE / GOLD", [
        ("LIABILITY", "Service Provider's liability is capped at 50% of the project fee. No liability for indirect or consequential losses."),
        ("INTELLECTUAL PROPERTY", "Service Provider retains all rights to its background IP and methodology. Client receives a non-exclusive license for use."),
        ("PAYMENT", "50% upfront payment required. Balance 50% within 7 days of milestone completion."),
        ("TERMINATION", "Agreement may only be terminated by Client for material breach. Service Provider may terminate for convenience with 15 days notice.")
    ])

if __name__ == "__main__":
    generate_spectrum()
