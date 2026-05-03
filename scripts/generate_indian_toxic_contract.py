from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def generate_indian_toxic_contract():
    path = "data/indian_toxic_contract.pdf"
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("CONSULTANCY AND SERVICE AGREEMENT", styles['Title']))
    story.append(Spacer(1, 0.4 * inch))

    # Introduction
    intro = """This Agreement is made at Mumbai on this 3rd day of May, 2026, by and between Bharat Megacorp Pvt Ltd ("Company") and the Independent Consultant ("Service Provider")."""
    story.append(Paragraph(intro, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 1: The Non-Compete Trap (Section 27 exploitation)
    story.append(Paragraph("1. NON-COMPETE AND RESTRICTIVE COVENANTS", styles['Heading3']))
    nc_text = """The Service Provider agrees that for a period of thirty-six (36) months following the termination of this Agreement, they shall not, directly or indirectly, engage with, consult for, or be employed by any entity anywhere in the Republic of India that operates in a similar or competing industry to that of the Company. Breach of this clause shall result in immediate liquidated damages of INR 10,00,000."""
    story.append(Paragraph(nc_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 2: The Audit Deduction Trap
    story.append(Paragraph("2. PAYMENT AND AUDIT DEDUCTIONS", styles['Heading3']))
    pay_text = """Invoices shall be payable within one hundred and twenty (120) days of receipt. The Company reserves the unilateral right to deduct up to 25% of any invoice amount for 'Administrative Overheads', 'Discretionary Quality Audits', or 'Internal Compliance Fees' without providing specific justification to the Service Provider."""
    story.append(Paragraph(pay_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 3: GST Liability Shifting
    story.append(Paragraph("3. TAXATION AND GST COMPLIANCE", styles['Heading3']))
    gst_text = """The Service Provider is solely responsible for all GST compliance. In the event the Company is unable to claim Input Tax Credit (ITC) due to any reason whatsoever, the Service Provider shall immediately indemnify the Company for the full GST amount plus a 24% interest penalty and an additional 'inconvenience fee' of INR 50,000 per instance."""
    story.append(Paragraph(gst_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 4: The Remote Jurisdiction (Distance Trap)
    story.append(Paragraph("4. DISPUTE RESOLUTION AND JURISDICTION", styles['Heading3']))
    gov_text = """This Agreement shall be governed by the laws of India. However, notwithstanding the location of the parties, any and all disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the Courts in Port Blair, Andaman and Nicobar Islands."""
    story.append(Paragraph(gov_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Closing
    story.append(Paragraph("IN WITNESS WHEREOF, the parties have signed this Agreement on the date first mentioned above.", styles['Normal']))

    doc.build(story)
    print(f"Indian toxic contract generated at: {path}")

if __name__ == "__main__":
    generate_indian_toxic_contract()
