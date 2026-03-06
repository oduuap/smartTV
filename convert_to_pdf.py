#!/usr/bin/env python3
"""
Convert UX Scenario HTML to PDF
Requires: pip install weasyprint
"""

import sys
import os

def convert_html_to_pdf():
    try:
        from weasyprint import HTML

        html_file = 'UX_Scenario.html'
        pdf_file = 'UX_Scenario.pdf'

        if not os.path.exists(html_file):
            print(f"❌ Error: {html_file} not found!")
            return False

        print(f"📄 Converting {html_file} to PDF...")
        HTML(html_file).write_pdf(pdf_file)
        print(f"✅ Successfully created {pdf_file}")
        print(f"📍 File location: {os.path.abspath(pdf_file)}")
        return True

    except ImportError:
        print("❌ Error: weasyprint not installed")
        print("\nTo install weasyprint, run:")
        print("  pip3 install weasyprint")
        print("\nOr alternatively, you can:")
        print("1. Open UX_Scenario.html in Chrome/Safari")
        print("2. Press Cmd+P (Print)")
        print("3. Select 'Save as PDF'")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    success = convert_html_to_pdf()
    sys.exit(0 if success else 1)
