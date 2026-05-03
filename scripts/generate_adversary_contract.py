from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def generate_toxic_contract():
    path = "data/adversary_exploit_demo.pdf"
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("MASTER SERVICES AGREEMENT", styles['Title']))
    story.append(Spacer(1, 0.5 * inch))

    # Introduction
    intro = """This Master Services Agreement ("Agreement") is entered into between Acme Megacorp ("Client") and the Undersigned ("Service Provider")."""
    story.append(Paragraph(intro, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 1: IP Landgrab (The Adversary's favorite)
    story.append(Paragraph("1. INTELLECTUAL PROPERTY", styles['Heading3']))
    ip_text = """The Service Provider hereby assigns to the Client all right, title, and interest in and to any and all Intellectual Property created, conceived, or reduced to practice by the Service Provider at any time in their life, whether related to this Agreement or otherwise, in perpetuity throughout the known universe."""
    story.append(Paragraph(ip_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 2: Uncapped Indemnity (The Financial Ruin Clause)
    story.append(Paragraph("2. INDEMNIFICATION AND LIABILITY", styles['Heading3']))
    indemnity_text = """Service Provider shall indemnify, defend, and hold harmless the Client from any and all claims, losses, or damages of any kind, including but not limited to punitive, consequential, and indirect damages. Service Provider's liability under this section shall be uncapped and shall survive the termination of this Agreement for 99 years."""
    story.append(Paragraph(indemnity_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 3: The Kill-Switch (Zero Payment)
    story.append(Paragraph("3. TERMINATION FOR CONVENIENCE", styles['Heading3']))
    term_text = """The Client may terminate this Agreement at any time, with or without cause, immediately upon verbal notice. In the event of such termination, the Client shall have no obligation to pay the Service Provider for any work performed prior to the date of termination."""
    story.append(Paragraph(term_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Clause 4: The Jurisdiction Maze
    story.append(Paragraph("4. GOVERNING LAW", styles['Heading3']))
    gov_text = """This Agreement shall be governed by the laws of the Cayman Islands. Any disputes arising out of or related to this Agreement shall be resolved exclusively in the courts of George Town, Grand Cayman, and the Service Provider waives any right to a jury trial or to claim inconvenient forum."""
    story.append(Paragraph(gov_text, styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Closing
    story.append(Paragraph("IN WITNESS WHEREOF, the parties have executed this Agreement.", styles['Normal']))

    doc.build(story)
    print(f"Toxic contract generated at: {path}")

if __name__ == "__main__":
    generate_toxic_contract()
