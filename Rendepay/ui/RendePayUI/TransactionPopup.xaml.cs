using CommunityToolkit.Maui.Views;

namespace RendePayUI.Popups
{
    public class TransactionResult
    {
        public string TargetCode { get; set; }
        public decimal Amount { get; set; }
    }

    public partial class TransactionPopup : Popup
    {
        private readonly bool _isTransfer;

        public TransactionPopup(string title, bool isTransfer)
        {
            InitializeComponent();

            _isTransfer = isTransfer;
            TitleLabel.Text = title;
            ConfirmButtonLabel.Text = isTransfer ? "Transfer" : "Withdraw";
            TargetCardContainer.IsVisible = isTransfer;
        }

        private void OnConfirmClicked(object sender, EventArgs e)
        {
            ErrorLabel.IsVisible = false;

            if (_isTransfer && string.IsNullOrWhiteSpace(TargetCardEntry.Text))
            {
                ShowError("Please enter target card code.");
                return;
            }

            if (!decimal.TryParse(AmountEntry.Text, out decimal amount) || amount <= 0)
            {
                ShowError("Please enter a valid amount.");
                return;
            }

            Close(new TransactionResult
            {
                TargetCode = TargetCardEntry.Text?.Trim(),
                Amount = amount
            });
        }

        private void OnCancelClicked(object sender, EventArgs e)
        {
            Close(null);
        }

        private void ShowError(string message)
        {
            ErrorLabel.Text = message;
            ErrorLabel.IsVisible = true;
        }
    }
}