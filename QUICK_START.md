# Quick Start - Sales Dashboard

## ⚡ Fastest Way to Use (30 seconds)

### Option 1: Run the Built App (No Installation)

```bash
cd dist
python -m http.server 8000
```

Then open: **http://localhost:8000**

Click **"Load Demo Data"** to see the dashboard in action.

---

## 📁 Upload Your Files

1. Click the upload area or drag files
2. Upload Excel (.xlsx) or CSV (.csv) files
3. The system auto-detects columns (Product, Quantity, Sales, Date, etc)
4. Confirm/edit column mappings if needed
5. Name your periods (e.g., "January 2026", "February 2026")
6. Click "Go to Dashboard"

---

## 📊 What You Get

- **Summary Cards**: Total sales, orders, quantity, AOV, profit
- **Charts**: Bar or line charts showing period comparisons
- **Product Table**: Searchable, sortable list with growth percentages
- **Top/Bottom**: Best and worst performing products
- **Growth Analysis**: Which products are growing/declining
- **Insights**: Auto-generated analysis (peak periods, top products, etc)
- **Filters**: By period, product, category, date range
- **Export**: Download results as Excel spreadsheet

---

## 🛠️ Development Mode (Optional)

If you want to modify the code:

```bash
# Install dependencies
npm install

# Start dev server with live reload
npm run dev

# Build for production
npm run build
```

---

## 🚀 Deployment

The `dist/` folder is ready to deploy to:
- Netlify (drag & drop)
- Vercel (git integration)
- AWS S3
- GitHub Pages
- Any static host

---

## 📝 File Format

Your files should have headers in the first row:

**Excel Example:**
```
Product | Quantity | Sales | Date
Math | 25 | 7500 | 2026-01-15
Science | 18 | 5400 | 2026-01-15
```

**CSV Example:**
```csv
Product,Qty,Amount,Date
Math,25,7500,2026-01-15
Science,18,5400,2026-01-15
```

---

## ❓ FAQ

**Q: Can I use my own files?**
A: Yes! Upload Excel (.xlsx/.xls) or CSV files. The app auto-detects columns.

**Q: Is my data secure?**
A: Yes! Everything processes in your browser. No data sent to any server.

**Q: Can I export results?**
A: Yes! Click "Export to Excel" to download a multi-sheet report.

**Q: What if column names don't match?**
A: Use the Column Mapping screen to manually map columns.

**Q: Can I modify the dashboard?**
A: Yes! Edit files in `src/` and run `npm run dev` to see changes.

---

**Need help?** Check `IMPLEMENTATION_GUIDE.md` for complete documentation.
